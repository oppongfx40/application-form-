from flask import Flask, request, jsonify

app = Flask(__name__)

# In-memory data storage (replace with a real database for production)
elections = {}
candidates = {}
voters = {}
votes = {}

# API Endpoints

# Create Election
@app.route('/elections', methods=['POST'])
def create_election():
    data = request.get_json()
    election_id = len(elections) + 1  # Simple ID generation
    elections[election_id] = {
        'name': data['name'],
        'description': data['description'],
        'status': 'open'
    }
    candidates[election_id] = {}
    votes[election_id] = {}
    return jsonify({'message': 'Election created', 'election_id': election_id}), 201

# Get All Elections
@app.route('/elections', methods=['GET'])
def get_elections():
    return jsonify(elections), 200
    
# Add Candidate
@app.route('/elections/<int:election_id>/candidates', methods=['POST'])
def add_candidate(election_id):
    data = request.get_json()
    candidate_id = len(candidates[election_id]) + 1
    candidates[election_id][candidate_id] = {
        'name': data['name'],
        'description': data['description']
    }
    return jsonify({'message': 'Candidate added', 'candidate_id': candidate_id}), 201

# Cast Vote
@app.route('/elections/<int:election_id>/vote', methods=['POST'])
def cast_vote(election_id):
    data = request.get_json()
    voter_id = data['voter_id']
    candidate_id = data['candidate_id']
    
    if voter_id in voters:
        return jsonify({'message': 'voter already voted'}), 400
    
    voters[voter_id] = election_id
    if election_id not in votes:
        votes[election_id] = {}
    
    if candidate_id not in votes[election_id]:
      votes[election_id][candidate_id] = 0

    votes[election_id][candidate_id] += 1
    return jsonify({'message': 'Vote cast'}), 200

# Get Election Results
@app.route('/elections/<int:election_id>/results', methods=['GET'])
def get_election_results(election_id):
    if election_id not in votes:
        return jsonify({'message': 'Election not found or no votes yet'}), 404
    
    result = {}
    for candidate_id, count in votes[election_id].items():
        result[candidate_id] = count
    return jsonify(result), 200

if __name__ == '__main__':
    app.run(debug=True)
