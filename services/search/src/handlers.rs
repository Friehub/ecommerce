use axum::{extract::{State, Query}, Json, http::StatusCode};
use serde::{Deserialize, Serialize};
use std::sync::Arc;
use crate::index::SearchIndex;
use tantivy::collector::TopDocs;
use tantivy::query::QueryParser;
use tantivy::Document;

#[derive(Deserialize)]
pub struct SearchParams {
    pub q: String,
    pub limit: Option<usize>,
}

#[derive(Serialize)]
pub struct SearchResponse {
    pub results: Vec<serde_json::Value>,
}

pub async fn search_handler(
    State(index): State<Arc<SearchIndex>>,
    Query(params): Query<SearchParams>,
) -> Result<Json<SearchResponse>, (StatusCode, Json<serde_json::Value>)> {
    let searcher = index.reader.searcher();
    
    let query_parser = QueryParser::for_index(&index.index, vec![index.fields.title, index.fields.description]);
    let query = query_parser.parse_query(&params.q).map_err(|e| {
        (StatusCode::BAD_REQUEST, Json(serde_json::json!({ "error": e.to_string() })))
    })?;

    let top_docs = searcher.search(&query, &TopDocs::with_limit(params.limit.unwrap_or(10))).map_err(|e| {
        (StatusCode::INTERNAL_SERVER_ERROR, Json(serde_json::json!({ "error": e.to_string() })))
    })?;

    let mut results = Vec::new();
    for (_score, doc_address) in top_docs {
        let retrieved_doc: tantivy::TantivyDocument = searcher.doc(doc_address).map_err(|e| {
            (StatusCode::INTERNAL_SERVER_ERROR, Json(serde_json::json!({ "error": e.to_string() })))
        })?;
        
        let json_doc = retrieved_doc.to_json(&index.schema);
        if let Ok(val) = serde_json::from_str(&json_doc) {
            results.push(val);
        }
    }

    Ok(Json(SearchResponse { results }))
}

pub async fn health_handler() -> &'static str {
    "OK"
}
