use tantivy::schema::*;
use tantivy::{Index, IndexReader, IndexWriter, ReloadPolicy};
use std::path::Path;
use anyhow::Result;
use std::sync::Arc;
use tokio::sync::Mutex;

pub struct SearchIndex {
    pub index: Index,
    pub reader: IndexReader,
    pub writer: Arc<Mutex<IndexWriter>>,
    pub schema: Schema,
    pub fields: ProductFields,
}

pub struct ProductFields {
    pub variant_id: Field,
    pub product_id: Field,
    pub title: Field,
    pub description: Field,
    pub brand_name: Field,
    pub category_id: Field,
    pub category_name: Field,
    pub seller_id: Field,
    pub seller_name: Field,
    pub price: Field,
    pub compare_price: Field,
    pub discount_pct: Field,
    pub rating: Field,
    pub review_count: Field,
    pub sales_velocity: Field,
    pub is_active: Field,
    pub is_in_stock: Field,
    pub is_flash_sale: Field,
    pub is_official_store: Field,
    pub shipping_days: Field,
    pub attributes: Field,
    pub image_url: Field,
    pub created_at: Field,
}

impl SearchIndex {
    pub fn new(index_path: &str) -> Result<Self> {
        let mut schema_builder = Schema::builder();

        let fields = ProductFields {
            variant_id: schema_builder.add_text_field("variant_id", STRING | STORED),
            product_id: schema_builder.add_text_field("product_id", STRING | STORED),
            title: schema_builder.add_text_field("title", TEXT | STORED),
            description: schema_builder.add_text_field("description", TEXT),
            brand_name: schema_builder.add_text_field("brand_name", TEXT | STORED),
            category_id: schema_builder.add_text_field("category_id", STRING | STORED),
            category_name: schema_builder.add_text_field("category_name", STORED),
            seller_id: schema_builder.add_text_field("seller_id", STRING | STORED),
            seller_name: schema_builder.add_text_field("seller_name", STORED),
            price: schema_builder.add_f64_field("price", INDEXED | STORED | FAST),
            compare_price: schema_builder.add_f64_field("compare_price", STORED),
            discount_pct: schema_builder.add_f64_field("discount_pct", INDEXED | STORED),
            rating: schema_builder.add_f64_field("rating", INDEXED | STORED | FAST),
            review_count: schema_builder.add_i64_field("review_count", INDEXED | STORED | FAST),
            sales_velocity: schema_builder.add_f64_field("sales_velocity", INDEXED | STORED | FAST),
            is_active: schema_builder.add_u64_field("is_active", INDEXED | STORED | FAST),
            is_in_stock: schema_builder.add_u64_field("is_in_stock", INDEXED | STORED | FAST),
            is_flash_sale: schema_builder.add_u64_field("is_flash_sale", INDEXED | STORED | FAST),
            is_official_store: schema_builder.add_u64_field("is_official_store", INDEXED | STORED | FAST),
            shipping_days: schema_builder.add_i64_field("shipping_days", INDEXED | STORED | FAST),
            attributes: schema_builder.add_json_field("attributes", TEXT | STORED),
            image_url: schema_builder.add_text_field("image_url", STORED),
            created_at: schema_builder.add_i64_field("created_at", INDEXED | STORED | FAST),
        };

        let schema = schema_builder.build();
        
        let index = if Path::new(index_path).exists() {
            Index::open_in_dir(index_path)?
        } else {
            std::fs::create_dir_all(index_path)?;
            Index::create_in_dir(index_path, schema.clone())?
        };

        let reader = index
            .reader_builder()
            .reload_policy(ReloadPolicy::OnCommitWithDelay)
            .try_into()?;

        // R06: Create a long-lived writer with 50MB budget
        let writer = Arc::new(Mutex::new(index.writer(50_000_000)?));

        Ok(Self {
            index,
            reader,
            writer,
            schema,
            fields,
        })
    }

}
