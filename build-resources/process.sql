CREATE VIRTUAL TABLE books_fts USING fts5(title, author, content='books', content_rowid='id');

-- Populate the FTS table with existing data
INSERT INTO books_fts(rowid, title, author)
SELECT id, Title, Author FROM books;

-- Create a regular index for lang and ext
CREATE INDEX idx_lang_ext ON books(lang, ext);

-- Create individual indexes for better query flexibility
CREATE INDEX idx_lang ON books(lang);
CREATE INDEX idx_ext ON books(ext);

insert into books_fts(books_fts) values ('optimize'); -- for every FTS table you have (if you have any)
