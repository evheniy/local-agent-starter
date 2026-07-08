# Demo

<video controls src="screenshots/demo-flow.webm" width="100%"></video>

This demo records a clean Docker Compose run of the local RAG shell with LM
Studio providing the embedding and chat models.

## Flow

1. Stop the existing Docker Compose stack.
2. Remove the Postgres volume and clear uploaded runtime documents.
3. Start the stack again.
4. Open the API-served UI at `http://localhost:3000/`.
5. Upload `docs/concepts.md`.
6. Wait for the background indexer to mark the file as ready.
7. Ask: `According to concepts.md, what is an agent in this project? Answer briefly.`
8. Confirm that the chat response includes retrieved sources and the stream
   finishes.

## Screenshots

![Home screen](screenshots/demo-01-home.png)

![Upload tab before selecting a file](screenshots/demo-02-upload-empty.png)

![Selected demo document](screenshots/demo-03-file-selected.png)

![Uploaded file while indexing](screenshots/demo-04-uploaded-indexing.png)

![Indexed file ready for chat](screenshots/demo-05-indexed-ready.png)

![Question prepared in the chat tab](screenshots/demo-06-question.png)

![Grounded answer with sources](screenshots/demo-07-answer.png)

## Mobile

![Mobile chat tab](screenshots/demo-mobile-chat.png)

![Mobile upload tab](screenshots/demo-mobile-upload.png)
