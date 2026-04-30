use tantivy::schema::*;
use tantivy::{Index, IndexReader, IndexWriter, ReloadPolicy};
use std::path::Path;
use anyhow::Result;

pub struct SearchIndex {
    pub index: Index,
    pub reader: IndexReader,
    pub schema: Schema,
    pub fields: ProductFields,
}

pub struct ProductFields {
    pub id: Field,
    pub title: Field,
    pub description: Field,
    pub category: Field,
    pub price: Field,
    pub attributes: Field,
}

impl SearchIndex {
    pub fn new(index_path: &str) -> Result<Self> {
        let mut schema_builder = Schema::builder();

        let fields = ProductFields {
            id: schema_builder.add_text_field("id", STRING | STORED),
            title: schema_builder.add_text_field("title", TEXT | STORED),
            description: schema_builder.add_text_field("description", TEXT),
            category: schema_builder.add_text_field("category", STRING | STORED),
            price: schema_builder.add_f64_field("price", INDEXED | STORED),
            attributes: schema_builder.add_json_field("attributes", TEXT | STORED),
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

        Ok(Self {
            index,
            reader,
            schema,
            fields,
        })
    }

    pub fn get_writer(&self, memory_budget_bytes: usize) -> Result<IndexWriter> {
        Ok(self.index.writer(memory_budget_bytes)?)
    }
}
