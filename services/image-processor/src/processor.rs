use image::{DynamicImage, ImageFormat};
use std::io::Cursor;
use anyhow::Result;

pub struct ImageProcessor;

impl ImageProcessor {
    pub fn resize(img: DynamicImage, width: u32, height: u32) -> DynamicImage {
        // Resize maintaining aspect ratio
        img.thumbnail(width, height)
    }

    pub fn to_webp(img: DynamicImage) -> Result<Vec<u8>> {
        let mut buffer = Cursor::new(Vec::new());
        img.write_to(&mut buffer, ImageFormat::WebP)?;
        Ok(buffer.into_inner())
    }

    pub fn process_buffer(buffer: &[u8], width: u32, height: u32) -> Result<Vec<u8>> {
        let img = image::load_from_memory(buffer)?;
        let resized = Self::resize(img, width, height);
        Self::to_webp(resized)
    }
}
