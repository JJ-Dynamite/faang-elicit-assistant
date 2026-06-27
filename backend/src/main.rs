use axum::{
    routing::{get, post},
    Router,
    Json,
    response::IntoResponse,
};
use serde::{Deserialize, Serialize};
use tower_http::cors::{CorsLayer, Any};
use tracing_subscriber;

#[derive(Serialize)]
struct HealthResponse {
    status: String,
    service: String,
    version: String,
}

#[derive(Serialize)]
struct ApiResponse<T: Serialize> {
    success: bool,
    data: Option<T>,
    error: Option<String>,
}

#[derive(Serialize)]
struct Paper {
    id: String,
    title: String,
    authors: Vec<String>,
    abstract_text: String,
    year: u32,
    citations: u32,
    url: String,
    journal: String,
}

#[derive(Deserialize)]
struct SearchRequest {
    query: String,
    limit: Option<u32>,
}

#[derive(Deserialize)]
struct AnalyzeRequest {
    paper_id: String,
    question: String,
}

async fn health_check() -> impl IntoResponse {
    Json(HealthResponse {
        status: "healthy".to_string(),
        service: "AI research paper assistant".to_string(),
        version: env!("CARGO_PKG_VERSION").to_string(),
    })
}

async fn root() -> impl IntoResponse {
    Json(ApiResponse::<()> {
        success: true,
        data: None,
        error: None,
    })
}

async fn search_papers(Json(req): Json<SearchRequest>) -> impl IntoResponse {
    let papers = vec![
        Paper {
            id: "1".to_string(),
            title: "Attention Is All You Need".to_string(),
            authors: vec!["Vaswani et al.".to_string()],
            abstract_text: "The dominant sequence transduction models are based on complex recurrent or convolutional neural networks...".to_string(),
            year: 2017,
            citations: 89000,
            url: "https://arxiv.org/abs/1706.03762".to_string(),
            journal: "NeurIPS".to_string(),
        },
        Paper {
            id: "2".to_string(),
            title: "BERT: Pre-training of Deep Bidirectional Transformers".to_string(),
            authors: vec!["Devlin et al.".to_string()],
            abstract_text: "We introduce a new language representation model called BERT...".to_string(),
            year: 2019,
            citations: 67000,
            url: "https://arxiv.org/abs/1810.04805".to_string(),
            journal: "NAACL".to_string(),
        },
    ];

    Json(ApiResponse {
        success: true,
        data: Some(papers),
        error: None,
    })
}

async fn analyze_paper(Json(req): Json<AnalyzeRequest>) -> impl IntoResponse {
    let analysis = serde_json::json!({
        "paper_id": req.paper_id,
        "summary": "This paper introduces a novel approach to transformers with attention mechanisms...",
        "key_findings": [
            "Self-attention mechanism outperforms RNNs",
            "Parallelizable training reduces computation time",
            "Achieves state-of-the-art on multiple benchmarks"
        ],
        "methodology": "The model uses multi-head self-attention and position-wise feed-forward networks.",
        "impact": "Highly influential - foundational architecture for GPT, BERT, and modern LLMs.",
        "confidence": 0.95
    });

    Json(ApiResponse {
        success: true,
        data: Some(analysis),
        error: None,
    })
}

async fn get_trending() -> impl IntoResponse {
    let trending = vec![
        serde_json::json!({
            "topic": "Large Language Models",
            "papers_count": 12345,
            "growth": "+156%"
        }),
        serde_json::json!({
            "topic": "Diffusion Models",
            "papers_count": 5678,
            "growth": "+89%"
        }),
    ];

    Json(ApiResponse {
        success: true,
        data: Some(trending),
        error: None,
    })
}

async fn get_stats() -> impl IntoResponse {
    Json(ApiResponse {
        success: true,
        data: Some(serde_json::json!({
            "total_papers": 23456789,
            "searches_today": 45678,
            "analyses_completed": 12345,
            "topics_covered": 5678
        })),
        error: None,
    })
}

#[tokio::main]
async fn main() {
    tracing_subscriber::fmt::init();

    let cors = CorsLayer::new()
        .allow_origin(Any)
        .allow_methods(Any)
        .allow_headers(Any);

    let app = Router::new()
        .route("/", get(root))
        .route("/health", get(health_check))
        .route("/api/search", post(search_papers))
        .route("/api/analyze", post(analyze_paper))
        .route("/api/trending", get(get_trending))
        .route("/api/stats", get(get_stats))
        .layer(cors);

    let listener = tokio::net::TcpListener::bind("0.0.0.0:3001")
        .await
        .unwrap();

    tracing::info!("AI research paper assistant backend running on port 3001");
    axum::serve(listener, app).await.unwrap();
}
