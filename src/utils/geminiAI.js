import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);

class GeminiService {
  constructor() {
    this.model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });
  }

  async generateInterviewQuestions() {
    const prompt = `
    Generate 6 interview questions for a Full Stack Developer (React/Node.js) position.
    Return EXACTLY 6 questions in this JSON format:
    {
      "questions": [
        {"id": 1, "difficulty": "easy", "question": "question text", "timeLimit": 20},
        {"id": 2, "difficulty": "easy", "question": "question text", "timeLimit": 20},
        {"id": 3, "difficulty": "medium", "question": "question text", "timeLimit": 60},
        {"id": 4, "difficulty": "medium", "question": "question text", "timeLimit": 60},
        {"id": 5, "difficulty": "hard", "question": "question text", "timeLimit": 120},
        {"id": 6, "difficulty": "hard", "question": "question text", "timeLimit": 120}
      ]
    }

    Requirements:
    - 2 Easy questions (20 seconds each): Basic concepts, syntax
    - 2 Medium questions (60 seconds each): Problem-solving, implementation
    - 2 Hard questions (120 seconds each): Complex scenarios, architecture
    - Focus on React, Node.js, JavaScript, databases, APIs
    - Questions should be practical and relevant to full-stack development
    `;

    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      // Extract JSON from the response
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      throw new Error('Invalid response format');
    } catch (error) {
      console.error('Error generating questions:', error);
      // Fallback questions
      return {
        questions: [
          {id: 1, difficulty: "easy", question: "What is the difference between let, const, and var in JavaScript?", timeLimit: 20},
          {id: 2, difficulty: "easy", question: "Explain what React hooks are and name three commonly used hooks.", timeLimit: 20},
          {id: 3, difficulty: "medium", question: "How would you implement authentication in a React application?", timeLimit: 60},
          {id: 4, difficulty: "medium", question: "Explain the concept of middleware in Express.js and provide an example.", timeLimit: 60},
          {id: 5, difficulty: "hard", question: "Design a scalable architecture for a real-time chat application using React and Node.js.", timeLimit: 120},
          {id: 6, difficulty: "hard", question: "How would you optimize the performance of a React application that handles large datasets?", timeLimit: 120}
        ]
      };
    }
  }

  async evaluateAnswer(question, answer, timeUsed, timeLimit) {
    const prompt = `
    Evaluate this interview answer:
    
    Question: "${question}"
    Answer: "${answer}"
    Time Used: ${timeUsed} seconds out of ${timeLimit} seconds
    
    Provide a score from 0-10 and brief feedback in this JSON format:
    {
      "score": 8,
      "feedback": "Good explanation of concepts, could be more detailed in implementation"
    }
    
    Consider:
    - Technical accuracy
    - Completeness of answer
    - Time management
    - Clarity of explanation
    `;

    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      throw new Error('Invalid response format');
    } catch (error) {
      console.error('Error evaluating answer:', error);
      // Fallback scoring
      const wordCount = answer.split(' ').length;
      const timeRatio = timeUsed / timeLimit;
      let score = Math.min(10, Math.max(1, wordCount / 10));
      if (timeRatio > 0.8) score *= 0.8; // Penalty for using too much time
      
      return {
        score: Math.round(score),
        feedback: "Answer evaluated. Consider providing more detailed explanations."
      };
    }
  }

  async generateFinalSummary(candidateData, questions) {
    const totalScore = questions.reduce((sum, q) => sum + (q.score || 0), 0);
    const averageScore = totalScore / questions.length;

    const prompt = `
    Generate a final interview summary for this candidate:
    
    Candidate: ${candidateData.name}
    Email: ${candidateData.email}
    Phone: ${candidateData.phone}
    Average Score: ${averageScore.toFixed(1)}/10
    
    Questions and Scores:
    ${questions.map((q, i) => `${i+1}. ${q.question} - Score: ${q.score || 0}/10`).join('\n')}
    
    Provide a comprehensive summary in this JSON format:
    {
      "overallScore": ${Math.round(averageScore)},
      "summary": "2-3 sentence summary of candidate performance",
      "strengths": ["strength1", "strength2"],
      "improvements": ["area1", "area2"],
      "recommendation": "hire/consider/reject"
    }
    `;

    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      throw new Error('Invalid response format');
    } catch (error) {
      console.error('Error generating summary:', error);
      return {
        overallScore: Math.round(averageScore),
        summary: `Candidate completed the interview with an average score of ${averageScore.toFixed(1)}/10.`,
        strengths: ["Completed all questions", "Showed technical knowledge"],
        improvements: ["Could provide more detailed answers", "Time management"],
        recommendation: averageScore >= 7 ? "hire" : averageScore >= 5 ? "consider" : "reject"
      };
    }
  }
}

export default new GeminiService();
