from flask import Flask, send_from_directory, request, jsonify, Blueprint
from flask_cors import CORS
from werkzeug.utils import secure_filename
import os
from langchain.chains import ConversationalRetrievalChain
from langchain.document_loaders import DirectoryLoader
from langchain.indexes import VectorstoreIndexCreator
from langchain.chat_models import ChatOpenAI
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__, static_folder='../frontend/dist')
CORS(app, resources={r"/api/*": {"origins": "http://localhost:3000"}})

# Blueprint setup for file upload
upload_blueprint = Blueprint('upload_blueprint', __name__)

UPLOAD_FOLDER = os.path.join('C:', 'Users', 'Tooba bibi', 'Desktop', 'chatbot_flask', 'backend', 'uploads')
ALLOWED_EXTENSIONS = {'pdf'}

os.makedirs(UPLOAD_FOLDER, exist_ok=True)

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS


@upload_blueprint.route('/upload', methods=['POST'])
def upload_file():
    uploaded_files = request.files.getlist("files")  # This should match the key used in FormData
    for file in uploaded_files:
        if file and allowed_file(file.filename):
            filename = secure_filename(file.filename)
            file_path = os.path.join(UPLOAD_FOLDER, filename)
            try:
                file.save(file_path)
            except Exception as e:
                app.logger.error(f"Failed to save file {filename}: {e}")
                return jsonify(error="Failed to save file"), 500
    return jsonify(message="Files uploaded successfully"), 200

api_key = os.getenv("OPENAI_API_KEY")
os.environ["OPENAI_API_KEY"] = api_key
PERSIST = False
chain = None

# Route for training the chatbot
@app.route('/api/chatbot/train', methods=['POST'])
def train_chatbot():
    global chain
    # You might want to pass the directory path or use a fixed one
    directory_path = UPLOAD_FOLDER  # Make sure this is the correct path to your documents
    loader = DirectoryLoader(directory_path)
    
    # Initialize Chroma with OpenAI embeddings
    chroma = Chroma(embedding_function=OpenAIEmbeddings(api_key=api_key))
    
    if PERSIST:
        # If you want to persist the index on disk
        chroma.save('persist')
        index = VectorStoreIndexWrapper(vectorstore=chroma)
    else:
        # Create the index from the loader without persisting
        index = VectorstoreIndexCreator().from_loaders([loader], vectorstore=chroma)
    
    chain = ConversationalRetrievalChain.from_llm(
        llm=ChatOpenAI(model="gpt-3.5-turbo", api_key=api_key),
        retriever=index.vectorstore.as_retriever(search_kwargs={"k": 1}),
    )
    
    return jsonify(message="Chatbot trained successfully"), 200

# Route for chatting with the chatbot
@app.route('/api/chatbot/chat', methods=['POST'])
def chat_with_bot():
    global chain
    if not chain:
        return jsonify(error="Chatbot is not trained yet"), 400
    
    query = request.json.get('query')
    chat_history = request.json.get('chat_history', [])
    
    if query.lower() in ['quit', 'q', 'exit']:
        return jsonify(message="Exiting chat"), 200
    
    result = chain({"question": query, "chat_history": chat_history})
    chat_history.append((query, result['answer']))
    
    return jsonify(answer=result['answer'], chat_history=chat_history), 200



# Register the blueprint after defining the route
app.register_blueprint(upload_blueprint)

@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve(path):
    if path and os.path.exists(app.static_folder + '/' + path):
        return send_from_directory(app.static_folder, path)
    else:
        return send_from_directory(app.static_folder, 'index.html')

if __name__ == '__main__':
    app.run(debug=True, port=5000)