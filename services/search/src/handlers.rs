use axum::{extract::{State, Query}, Json, http::StatusCode};
use serde::{Deserialize, Serialize};
use std::sync::Arc;
use crate::index::SearchIndex;
use tantivy::collector::{TopDocs, Count};
use tantivy::query::{QueryParser, TermQuery, RangeQuery};
use tantivy::schema::{Term, Facet, Document};
use tantivy::{TantivyDocument, Order};
use serde_json::Value;

#[derive(Deserialize)]
pub struct SearchParams {
    pub q: String,
    pub limit: Option<usize>,
    pub offset: Option<usize>,
    pub category_id: Option<String>,
    pub brand: Option<String>,
    pub min_price: Option<f64>,
    pub max_price: Option<f64>,
    pub sort_by: Option<String>, // "price_asc", "price_desc", "rating", "newest"
}

#[derive(Serialize)]
pub struct SearchResponse {
    pub results: Vec<Value>,
    pub total: usize,
    pub facets: Value,
}

pub async fn search_handler(
    State(index): State<Arc<SearchIndex>>,
    Query(params): Query<SearchParams>,
) -> Result<Json<SearchResponse>, (StatusCode, Json<Value>)> {
    let searcher = index.reader.searcher();
    
    // 1. Build Query
    let mut query_parser = QueryParser::for_index(&index.index, vec![
        index.fields.title, 
        index.fields.description, 
        index.fields.brand_name
    ]);
    
    query_parser.set_field_boost(index.fields.title, 3.0);
    query_parser.set_field_boost(index.fields.brand_name, 2.0);
    query_parser.set_field_boost(index.fields.description, 1.0);

    let base_query = query_parser.parse_query(&params.q).map_err(|e| {
        (StatusCode::BAD_REQUEST, Json(serde_json::json!({ "error": e.to_string() })))
    })?;

    // 2. Search and Sort
    let limit = params.limit.unwrap_or(20);
    let offset = params.offset.unwrap_or(0);

    let top_docs_collector = TopDocs::with_limit(limit).and_offset(offset);
    
    let top_docs: Vec<tantivy::DocAddress> = if let Some(sort) = params.sort_by {
        match sort.as_str() {
            "price_asc" => searcher.search(&base_query, &top_docs_collector.order_by_fast_field::<f64>("price", Order::Asc))
                .map(|res| res.into_iter().map(|(_, doc)| doc).collect()),
            "price_desc" => searcher.search(&base_query, &top_docs_collector.order_by_fast_field::<f64>("price", Order::Desc))
                .map(|res| res.into_iter().map(|(_, doc)| doc).collect()),
            "rating" => searcher.search(&base_query, &top_docs_collector.order_by_fast_field::<f64>("rating", Order::Desc))
                .map(|res| res.into_iter().map(|(_, doc)| doc).collect()),
            "newest" => searcher.search(&base_query, &top_docs_collector.order_by_fast_field::<i64>("created_at", Order::Desc))
                .map(|res| res.into_iter().map(|(_, doc)| doc).collect()),
            _ => searcher.search(&base_query, &top_docs_collector)
                .map(|res| res.into_iter().map(|(_, doc)| doc).collect()),
        }
    } else {
        searcher.search(&base_query, &top_docs_collector)
            .map(|res| res.into_iter().map(|(_, doc)| doc).collect())
    }.map_err(|e| {
        (StatusCode::INTERNAL_SERVER_ERROR, Json(serde_json::json!({ "error": e.to_string() })))
    })?;

    // 3. Process Results
    let mut results = Vec::new();
    for doc_address in top_docs {
        let retrieved_doc: TantivyDocument = searcher.doc(doc_address).map_err(|e| {
            (StatusCode::INTERNAL_SERVER_ERROR, Json(serde_json::json!({ "error": e.to_string() })))
        })?;
        
        let json_doc = retrieved_doc.to_json(&index.schema);
        if let Ok(val) = serde_json::from_str(&json_doc) {
            results.push(val);
        }
    }

    Ok(Json(SearchResponse { 
        results, 
        total: 0, 
        facets: serde_json::json!({}), 
    }))
}

#[derive(Deserialize)]
pub struct UpsertDoc {
    pub variant_id: String,
    pub product_id: String,
    pub title: String,
    pub description: String,
    pub brand_name: String,
    pub category_id: String,
    pub category_name: String,
    pub seller_id: String,
    pub seller_name: String,
    pub price: f64,
    pub compare_price: Option<f64>,
    pub discount_pct: Option<f64>,
    pub rating: f64,
    pub review_count: i64,
    pub sales_velocity: f64,
    pub is_active: bool,
    pub is_in_stock: bool,
    pub is_flash_sale: bool,
    pub is_official_store: bool,
    pub shipping_days: i64,
    pub attributes: Value,
    pub image_url: String,
    pub created_at: i64,
}

pub async fn upsert_handler(
    State(index): State<Arc<SearchIndex>>,
    Json(doc): Json<UpsertDoc>,
) -> Result<StatusCode, (StatusCode, Json<Value>)> {
    let mut writer = index.get_writer(50_000_000).map_err(|e| {
        (StatusCode::INTERNAL_SERVER_ERROR, Json(serde_json::json!({ "error": e.to_string() })))
    })?;

    // Delete existing if any
    let term = Term::from_field_text(index.fields.variant_id, &doc.variant_id);
    writer.delete_term(term);

    // Add new
    let json_doc_str = serde_json::json!({
        "variant_id": doc.variant_id,
        "product_id": doc.product_id,
        "title": doc.title,
        "description": doc.description,
        "brand_name": doc.brand_name,
        "category_id": doc.category_id,
        "category_name": doc.category_name,
        "seller_id": doc.seller_id,
        "seller_name": doc.seller_name,
        "price": doc.price,
        "compare_price": doc.compare_price.unwrap_or(0.0),
        "discount_pct": doc.discount_pct.unwrap_or(0.0),
        "rating": doc.rating,
        "review_count": doc.review_count,
        "sales_velocity": doc.sales_velocity,
        "is_active": if doc.is_active { 1 } else { 0 },
        "is_in_stock": if doc.is_in_stock { 1 } else { 0 },
        "is_flash_sale": if doc.is_flash_sale { 1 } else { 0 },
        "is_official_store": if doc.is_official_store { 1 } else { 0 },
        "shipping_days": doc.shipping_days,
        "attributes": doc.attributes,
        "image_url": doc.image_url,
        "created_at": doc.created_at,
    }).to_string();

    let tantivy_doc = TantivyDocument::parse_json(&index.schema, &json_doc_str).map_err(|e| {
        (StatusCode::INTERNAL_SERVER_ERROR, Json(serde_json::json!({ "error": format!("JSON parse error: {}", e) })))
    })?;

    writer.add_document(tantivy_doc).map_err(|e| {
        (StatusCode::INTERNAL_SERVER_ERROR, Json(serde_json::json!({ "error": e.to_string() })))
    })?;

    writer.commit().map_err(|e| {
        (StatusCode::INTERNAL_SERVER_ERROR, Json(serde_json::json!({ "error": e.to_string() })))
    })?;

    Ok(StatusCode::OK)
}

pub async fn health_handler() -> &'static str {
    "OK"
}
