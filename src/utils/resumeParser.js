import mammoth from 'mammoth';

// For PDF parsing, we'll use a simpler approach that works better in Vite
const loadPdfJs = async () => {
  if (typeof window !== 'undefined' && !window.pdfjsLib) {
    // Load PDF.js dynamically
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
    document.head.appendChild(script);
    
    return new Promise((resolve) => {
      script.onload = () => {
        window.pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
        resolve(window.pdfjsLib);
      };
    });
  }
  return window.pdfjsLib;
};

class ResumeParser {
  async parseFile(file) {
    try {
      let text = '';
      
      if (file.type === 'application/pdf') {
        text = await this.parsePDF(file);
      } else if (file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
        text = await this.parseDOCX(file);
      } else {
        throw new Error('Unsupported file type. Please upload PDF or DOCX files only.');
      }

      return this.extractFields(text);
    } catch (error) {
      console.error('Error parsing resume:', error);
      throw error;
    }
  }

  async parsePDF(file) {
    return new Promise(async (resolve, reject) => {
      try {
        const pdfjsLib = await loadPdfJs();
        const reader = new FileReader();
        
        reader.onload = async (e) => {
          try {
            const arrayBuffer = e.target.result;
            const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
            let fullText = '';

            for (let i = 1; i <= pdf.numPages; i++) {
              const page = await pdf.getPage(i);
              const textContent = await page.getTextContent();
              const pageText = textContent.items.map(item => item.str).join(' ');
              fullText += pageText + ' ';
            }

            resolve(fullText);
          } catch (error) {
            reject(error);
          }
        };
        reader.onerror = () => reject(new Error('Failed to read PDF file'));
        reader.readAsArrayBuffer(file);
      } catch (error) {
        reject(new Error('Failed to load PDF.js library'));
      }
    });
  }

  async parseDOCX(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const arrayBuffer = e.target.result;
          const result = await mammoth.extractRawText({ arrayBuffer });
          resolve(result.value);
        } catch (error) {
          reject(error);
        }
      };
      reader.onerror = () => reject(new Error('Failed to read DOCX file'));
      reader.readAsArrayBuffer(file);
    });
  }

  extractFields(text) {
    const fields = {
      name: null,
      email: null,
      phone: null,
    };

    // Extract email
    const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g;
    const emailMatch = text.match(emailRegex);
    if (emailMatch) {
      fields.email = emailMatch[0];
    }

    // Extract phone number
    const phoneRegex = /(?:\+?1[-.\s]?)?\(?([0-9]{3})\)?[-.\s]?([0-9]{3})[-.\s]?([0-9]{4})|(?:\+?91[-.\s]?)?[6-9]\d{9}/g;
    const phoneMatch = text.match(phoneRegex);
    if (phoneMatch) {
      fields.phone = phoneMatch[0].replace(/\D/g, ''); // Remove non-digits
      // Format phone number
      if (fields.phone.length === 10) {
        fields.phone = `+1-${fields.phone.slice(0,3)}-${fields.phone.slice(3,6)}-${fields.phone.slice(6)}`;
      } else if (fields.phone.length === 11 && fields.phone.startsWith('1')) {
        fields.phone = `+${fields.phone.slice(0,1)}-${fields.phone.slice(1,4)}-${fields.phone.slice(4,7)}-${fields.phone.slice(7)}`;
      }
    }

    // Extract name (this is more complex, using heuristics)
    const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
    
    // Look for name in first few lines, avoiding common resume keywords
    const skipWords = ['resume', 'cv', 'curriculum', 'vitae', 'profile', 'summary', 'objective', 'experience', 'education', 'skills'];
    
    for (let i = 0; i < Math.min(5, lines.length); i++) {
      const line = lines[i].toLowerCase();
      
      // Skip lines with email or phone
      if (line.includes('@') || /\d{3}[-.\s]?\d{3}[-.\s]?\d{4}/.test(line)) continue;
      
      // Skip lines with common resume keywords
      if (skipWords.some(word => line.includes(word))) continue;
      
      // Look for lines that might be names (2-4 words, mostly letters)
      const words = lines[i].split(/\s+/);
      if (words.length >= 2 && words.length <= 4) {
        const isLikelyName = words.every(word => 
          /^[A-Za-z]+$/.test(word) && word.length > 1
        );
        
        if (isLikelyName) {
          fields.name = lines[i];
          break;
        }
      }
    }

    return fields;
  }

  validateFields(fields) {
    const missing = [];
    
    if (!fields.name) missing.push('name');
    if (!fields.email) missing.push('email');
    if (!fields.phone) missing.push('phone');
    
    return {
      isValid: missing.length === 0,
      missingFields: missing,
      extractedFields: fields
    };
  }
}

export default new ResumeParser();
