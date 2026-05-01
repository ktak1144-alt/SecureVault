const getAICategory = async (fileName, mimetype, fileSize) => {
  try {
    const name = fileName.toLowerCase();

    // Sensitive files detection
    const sensitiveKeywords = [
      "invoice", "salary", "bank", "payment", "tax",
      "aadhar", "pan", "passport", "credit", "account",
      "confidential", "private", "secret"
    ];
   if (sensitiveKeywords.some(k => name.includes(k))) {
      const result = {
        category: "Sensitive",
        description: "This file contains sensitive personal or financial information.",
        tags: ["sensitive", "private", "confidential"],
        sensitivityLevel: "High"
      };
      console.log(`🤖 AI Categorized: ${fileName} → ${result.category}`);
      return result;
    }
    
    // Image files
    if (mimetype.includes("image")) {
      return {
        category: "Image",
        description: "An image file stored securely in SecureVault.",
        tags: ["image", "media", "visual"],
        sensitivityLevel: "Low"
      };
    }

    // Spreadsheet files
    if (
      mimetype.includes("sheet") ||
      mimetype.includes("excel") ||
      name.includes(".csv") ||
      name.includes(".xlsx") ||
      name.includes(".xls")
    ) {
      return {
        category: "Spreadsheet",
        description: "A spreadsheet file containing tabular data.",
        tags: ["spreadsheet", "data", "excel"],
        sensitivityLevel: "Medium"
      };
    }

    // Presentation files
    if (
      mimetype.includes("presentation") ||
      mimetype.includes("powerpoint") ||
      name.includes(".ppt") ||
      name.includes(".pptx")
    ) {
      return {
        category: "Presentation",
        description: "A presentation file with slides and content.",
        tags: ["presentation", "slides", "powerpoint"],
        sensitivityLevel: "Low"
      };
    }

    // Report detection
    const reportKeywords = [
      "report", "analysis", "summary", "research",
      "project", "thesis", "dissertation", "internship"
    ];
    if (reportKeywords.some(k => name.includes(k))) {
      return {
        category: "Report",
        description: "A report or research document.",
        tags: ["report", "document", "research"],
        sensitivityLevel: "Medium"
      };
    }

    // PDF and Word documents
    if (
      mimetype.includes("pdf") ||
      mimetype.includes("word") ||
      name.includes(".doc") ||
      name.includes(".docx")
    ) {
      return {
        category: "Document",
        description: "A document file stored securely in SecureVault.",
        tags: ["document", "pdf", "file"],
        sensitivityLevel: "Low"
      };
    }

    // Text/Notes files
    if (mimetype.includes("text") || name.includes(".txt")) {
      return {
        category: "Notes",
        description: "A text file or notes document.",
        tags: ["notes", "text", "memo"],
        sensitivityLevel: "Low"
      };
    }

    // Default
    return {
      category: "Other",
      description: "A file stored securely in SecureVault.",
      tags: ["file", "upload", "secure"],
      sensitivityLevel: "Low"
    };

  } catch (error) {
    console.error("❌ Categorization error:", error.message);
    return {
      category: "Other",
      description: "File uploaded to SecureVault.",
      tags: ["uncategorized"],
      sensitivityLevel: "Low"
    };
  }
};

module.exports = { getAICategory };