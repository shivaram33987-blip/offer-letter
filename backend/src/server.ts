import app from './app';

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Word PDF Generator Backend running on http://localhost:${PORT}`);
  console.log(`📁 Templates stored in /templates, Generated files in /generated`);
});
