const express = require("express");
const app = express();
const mongoose = require("mongoose");
const cors = require("cors");
const multer = require("multer");

// Load environment variables
require("dotenv").config();

// Middleware
app.use(express.json());
app.use(cors());
app.use("/files", express.static("files"));

// MongoDB connection
mongoose
  .connect(process.env.MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Connected to database");
  })
  .catch((e) => {
    console.error("MongoDB connection error:", e.message);
  });

// Multer configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./files");
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now();
    cb(null, uniqueSuffix + file.originalname);
  },
});

const upload = multer({ storage: storage });

// Mongoose Model
require("./pdfDetails");
const PdfSchema = mongoose.model("PdfDetails");

// Routes
app.post("/upload-files", upload.single("file"), async (req, res) => {
  console.log(req.file);
  const title = req.body.title;
  const fileName = req.file.filename;
  try {
    await PdfSchema.create({ title: title, pdf: fileName });
    res.send({ status: "ok" });
  } catch (error) {
    console.error("Error uploading file:", error.message);
    res.status(500).json({ status: "error", message: error.message });
  }
});

app.get("/get-files", async (req, res) => {
  try {
    const data = await PdfSchema.find({});
    res.send({ status: "ok", data: data });
  } catch (error) {
    console.error("Error fetching files:", error.message);
    res.status(500).json({ status: "error", message: error.message });
  }
});

app.get("/", async (req, res) => {
  res.send("Success!!!!!!");
});// Update PDF title
app.put('/update-title/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { title } = req.body;

    const updatedPdf = await PdfSchema.findByIdAndUpdate(
      id,
      { title },
      { new: true }
    );

    if (!updatedPdf) {
      return res.status(404).json({ status: 'error', message: 'PDF not found' });
    }

    res.json({ status: 'ok', data: updatedPdf });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});

// Delete PDF file
app.delete('/delete-file/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const deletedPdf = await PdfSchema.findByIdAndDelete(id);

    if (!deletedPdf) {
      return res.status(404).json({ status: 'error', message: 'PDF not found' });
    }

    res.json({ status: 'ok', message: 'PDF deleted successfully' });
  } catch (error) {
    res.status(500).json({ status: 'error', message: error.message });
  }
});


// Start server
const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});
