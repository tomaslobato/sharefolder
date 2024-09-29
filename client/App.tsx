import React, { useState } from "react"
import Sidebar from "./components/Sidebar"

export default function App() {
    const [fileId, setFileId] = useState<string>()
    const [content, setContent] = useState("")

    function SaveNewContent() {
        const encodedId = encodeURIComponent(fileId!)

        fetch(`/save/${encodedId}`, {
            method: "post",
            headers: {
                "Content-Type": "application/json"
            },
            body: content
        })
    }

    return (
        <div className="main">
            <Sidebar setContent={setContent} setFileId={setFileId} />
            <main className="editor">
                <header><h1>{fileId ? fileId : "select a file"}</h1><button className="savebtn">Save</button></header>
                <textarea name="" id="" value={content} className="editor" onChange={(ev) => setContent(ev.target.value)}></textarea>
            </main>
        </div>
    )
}