import React, { useState } from "react"
import Sidebar from "./components/Sidebar"
import { ChevronsLeftIcon, ChevronsRightIcon } from "lucide-react"

export default function App() {
    const [fileId, setFileId] = useState<string>()
    const [content, setContent] = useState("")
    const [isOpen, setIsOpen] = useState(true)

    async function SaveNewContent() {
        const encodedId = encodeURIComponent(fileId!)

        const res = await fetch(`/save/${encodedId}`, {
            method: "post",
            headers: {
                "Content-Type": "text/plain"
            },
            body: content
        })
        const json = await res.json()
    }

    return (
        <div className="main">
            <Sidebar setContent={setContent} setFileId={setFileId} isOpen={isOpen}/>
            <main className="editor">
                <header>
                    <div style={{display:"flex", gap: "10px"}}>
                        <button className="sidebarbtn" onClick={() => setIsOpen(!isOpen)}>
                            {isOpen ? <ChevronsLeftIcon /> : <ChevronsRightIcon />}
                        </button >
                        <h1>{fileId ? fileId : "select a file"}</h1>
                    </div>
                    <button className="savebtn" onClick={SaveNewContent}>Save</button>
                </header>
                {fileId && <textarea name="editor" id="editor" value={content} onChange={(ev) => setContent(ev.target.value)} />}
            </main>
        </div>
    )
}