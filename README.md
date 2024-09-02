# Library Management DApp

This decentralized application (DApp) implements a simple library management system using Cartesi Rollups technology. Users can add books to the library, borrow books, and query the library's state.

## Features

- Add books to the library
- Borrow books from the library
- View all books in the library
- Get details of a specific book
- Track total number of books

## Prerequisites

- Node.js (v14 or later recommended)
- Cartesi Rollups environment

## Installation

1. Clone this repository:

   ```
   git clone <repository-url>
   cd library-management-dapp
   ```

2. Install dependencies:
   ```
   npm install
   ```

## Running the DApp

Start the DApp using the Cartesi Rollups environment. Refer to the Cartesi documentation for detailed instructions on how to run a Rollups DApp.

## Interacting with the DApp

### Sending Inputs (Advance Requests)

Use the Cartesi Rollups CLI or SDK to send inputs to the DApp:

1. Add a book:

   ```json
   {
     "type": "add_book",
     "id": "book1",
     "title": "The Great Gatsby",
     "author": "F. Scott Fitzgerald"
   }
   ```

2. Borrow a book:
   ```json
   { "type": "borrow_book", "id": "book1" }
   ```

### Making Inspect Calls

To read the state without modifying it, use the following inspect payloads:

- Get all books: `"list"`
- Get total number of books: `"total"`
- Get details of a specific book: `"details/<book_id>"` (e.g., `"details/book1"`)
