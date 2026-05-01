use axum::{
    extract::{Multipart, Query},
    http::{header, StatusCode},
    response::IntoResponse,
};
use serde::Deserialize;
use crate::processor::ImageProcessor;

#[derive(Deserialize)]
pub struct ProcessParams {
    pub w: Option<u32>,
    pub h: Option<u32>,
}

pub async fn process_image_handler(
    Query(params): Query<ProcessParams>,
    mut multipart: Multipart,
) -> Result<impl IntoResponse, (StatusCode, String)> {
    if let Some(field) = multipart.next_field().await.map_err(|e| (StatusCode::BAD_REQUEST, e.to_string()))? {
        let data = field.bytes().await.map_err(|e| (StatusCode::INTERNAL_SERVER_ERROR, e.to_string()))?;
        
        let width = params.w.unwrap_or(800);
        let height = params.h.unwrap_or(800);

        let processed = ImageProcessor::process_buffer(&data, width, height)
            .map_err(|e| (StatusCode::UNPROCESSABLE_ENTITY, e.to_string()))?;

        Ok((
            [(header::CONTENT_TYPE, "image/webp")],
            processed,
        ))
    } else {
        Err((StatusCode::BAD_REQUEST, "No file uploaded".to_string()))
    }
}

pub async fn health_handler() -> &'static str {
    "OK"
}
