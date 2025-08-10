import os
import torch
import gradio as gr
import whisper
from transformers import AutoTokenizer, AutoModelForCausalLM

# --- Configuration for Cache Directories ---
CACHE_DIR = "/app/cache"
os.makedirs(CACHE_DIR, exist_ok=True)
os.environ["HF_HOME"] = CACHE_DIR
os.environ["TORCH_HOME"] = CACHE_DIR

# --- Model Configuration ---
WHISPER_MODEL_NAME = os.getenv("WHISPER_MODEL", "tiny")
# Use an open-access model instead of gated Gemma
LLM_MODEL_NAME = os.getenv("LLM_MODEL", "microsoft/DialoGPT-medium")
HF_TOKEN = os.getenv("HF_TOKEN")  # Optional now
DEVICE = "cuda" if torch.cuda.is_available() else "cpu"

# --- Load Models ---
print("Loading Whisper model...")
whisper_model = whisper.load_model(WHISPER_MODEL_NAME, download_root=CACHE_DIR)
print("Loading LLM and tokenizer...")

# Load tokenizer and model with optional token
try:
    if HF_TOKEN:
        tokenizer = AutoTokenizer.from_pretrained(LLM_MODEL_NAME, token=HF_TOKEN, cache_dir=CACHE_DIR)
        llm = AutoModelForCausalLM.from_pretrained(LLM_MODEL_NAME, token=HF_TOKEN, cache_dir=CACHE_DIR).to(DEVICE)
    else:
        tokenizer = AutoTokenizer.from_pretrained(LLM_MODEL_NAME, cache_dir=CACHE_DIR)
        llm = AutoModelForCausalLM.from_pretrained(LLM_MODEL_NAME, cache_dir=CACHE_DIR).to(DEVICE)
    print("Models loaded successfully!")
except Exception as e:
    print(f"Error loading models: {e}")
    print("Falling back to basic text processing...")
    # Fallback: create simple text-based feedback
    tokenizer = None
    llm = None

# --- Functions ---
def transcribe(audio):
    """
    Transcribe audio file to text using Whisper.
    """
    if audio is None:
        return ""
    result = whisper_model.transcribe(audio)
    return result['text']

def generate_feedback(answer):
    """
    Generate interview feedback for a given answer using LLM.
    """
    if not answer or not answer.strip():
        return "Please provide an answer for feedback."
    
    # If LLM model is available, use it
    if tokenizer and llm:
        try:
            prompt = (
                "You are an expert interview coach. "
                "Give constructive, specific, and actionable feedback for the following interview answer:\n\n"
                f"Answer: {answer}\n\nFeedback:"
            )
            inputs = tokenizer(prompt, return_tensors="pt").to(DEVICE)
            outputs = llm.generate(**inputs, max_new_tokens=120, do_sample=True, temperature=0.7)
            feedback = tokenizer.decode(outputs[0], skip_special_tokens=True)
            # Remove the prompt from the output if present
            feedback = feedback.split("Feedback:")[-1].strip()
            return feedback
        except Exception as e:
            print(f"LLM generation failed: {e}")
            # Fall through to basic feedback
    
    # Fallback: provide basic feedback based on answer length and content
    answer_length = len(answer.strip())
    
    if answer_length < 50:
        return "Your answer is quite brief. Consider providing more specific examples and details to demonstrate your knowledge and experience."
    elif answer_length < 150:
        return "Good start! Try to include more concrete examples, quantify your achievements, and explain your reasoning to make your answer more compelling."
    else:
        return "Excellent detailed response! You've provided good context and examples. Consider also mentioning the impact of your actions and what you learned from the experience."

def full_pipeline(audio, answer):
    """
    Transcribe audio and generate feedback for the answer.
    """
    transcript = transcribe(audio)
    feedback = generate_feedback(answer if answer else transcript)
    return transcript, feedback

# --- Gradio Interface ---
iface = gr.Interface(
    fn=full_pipeline,
    inputs=[
        gr.Audio(type="filepath", label="Your Answer (Audio)"),
        gr.Textbox(label="Or Paste Your Answer (Text)", lines=4, placeholder="Paste your answer here or record audio above...")
    ],
    outputs=[
        gr.Textbox(label="Transcription"),
        gr.Textbox(label="AI Feedback")
    ],
    title="AI Interview Coach",
    description="Record or paste your interview answer. Get instant transcription and AI-powered feedback."
)

if __name__ == "__main__":
    iface.launch(server_name="0.0.0.0", server_port=7860)