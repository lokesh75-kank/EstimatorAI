import uvicorn

if __name__ == "__main__":
    uvicorn.run("estimator_agent.api:app", host="0.0.0.0", port=8001, reload=True) 