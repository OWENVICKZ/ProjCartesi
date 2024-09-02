const { ethers } = require("ethers");

const rollup_server = process.env.ROLLUP_HTTP_SERVER_URL;
console.log("HTTP rollup_server url is " + rollup_server);

function hex2str(hex) {
  return ethers.toUtf8String(hex);
}

function str2hex(payload) {
  return ethers.hexlify(ethers.toUtf8Bytes(payload));
}

function isNumeric(num) {
  return !isNaN(num);
}

let books = [];
let totalBooks = 0;

async function handle_advance(data) {
  console.log("Received advance request data " + JSON.stringify(data));

  const metadata = data["metadata"];
  const sender = metadata["msg_sender"];
  const payload = data["payload"];

  let action;
  try {
    action = JSON.parse(hex2str(payload));
  } catch (error) {
    const report_req = await fetch(rollup_server + "/report", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ payload: str2hex("Invalid JSON format") }),
    });
    return "reject";
  }

  if (action.type === "add_book") {
    books.push({ id: action.id, title: action.title, author: action.author, borrower: null });
    totalBooks += 1;
    console.log(`Book added: ${action.id}`);
  } else if (action.type === "borrow_book") {
    const book = books.find(b => b.id === action.id);
    if (book && book.borrower === null) {
      book.borrower = sender;
      console.log(`Book borrowed: ${action.id}`);
    } else {
      console.log(`Invalid book ID or book already borrowed: ${action.id}`);
      return "reject";
    }
  } else {
    console.log("Invalid action type");
    return "reject";
  }

  const notice_req = await fetch(rollup_server + "/notice", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ payload: str2hex(`Action processed: ${action.type}`) }),
  });

  return "accept";
}

async function handle_inspect(data) {
  console.log("Received inspect request data " + JSON.stringify(data));

  const payload = data["payload"];
  const route = hex2str(payload);

  let responseObject;
  if (route === "list") {
    responseObject = JSON.stringify({ books });
  } else if (route === "total") {
    responseObject = JSON.stringify({ totalBooks });
  } else if (route.startsWith("details/")) {
    const bookId = route.split("/")[1];
    const book = books.find(b => b.id === bookId);
    if (book) {
      responseObject = JSON.stringify({ id: book.id, title: book.title, author: book.author, borrower: book.borrower });
    } else {
      responseObject = "Book not found";
    }
  } else {
    responseObject = "route not implemented";
  }

  const report_req = await fetch(rollup_server + "/report", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ payload: str2hex(responseObject) }),
  });

  return "accept";
}

var handlers = {
  advance_state: handle_advance,
  inspect_state: handle_inspect,
};

var finish = { status: "accept" };

(async () => {
  while (true) {
    const finish_req = await fetch(rollup_server + "/finish", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ status: "accept" }),
    });

    console.log("Received finish status " + finish_req.status);

    if (finish_req.status == 202) {
      console.log("No pending rollup request, trying again");
    } else {
      const rollup_req = await finish_req.json();
      var handler = handlers[rollup_req["request_type"]];
      finish["status"] = await handler(rollup_req["data"]);
    }
  }
})();