import React, { Fragment, useEffect, useState } from "react"
import { ChevronDownIcon, ChevronRightIcon, FilePlusIcon, FolderPlusIcon, Trash2Icon, XIcon } from "lucide-react"

type File = {
    name: string
    isDir: boolean
    isOpen: boolean
    id: string
    childOf: string
}

type InputOpen = {
    open: boolean
    type: "file" | "dir"
}

type Props = {
    setContent: React.Dispatch<React.SetStateAction<string>>
    setFileId: React.Dispatch<string>
}

export default function Sidebar({ setContent, setFileId }: Props) {
    const [files, setFiles] = useState<File[] | null>(null)
    const [error, setError] = useState<string | null>(null)
    const [inputOpen, setInputOpen] = useState<InputOpen>({ open: false, type: "file" })
    const [input, setInput] = useState("")
    const [selectedDir, setSelectedDir] = useState<File | null>(null)

    useEffect(() => {
        async function getFiles() {
            try {
                const res = await fetch("/getfiles")
                if (!res.ok) {
                    throw new Error("Failed to fetch files")
                }
                const json = await res.json()
                console.log(json)
                setFiles(json)
            } catch (err) {
                setError("Error loading files")
            }
        }

        getFiles()
    }, [])

    if (error) {
        return <h3>{error}</h3>
    }

    function toggleOpen(id: string) {
        if (!files) return
        const idx = files?.findIndex(file => file.id === id)
        const newFiles = [...files]
        newFiles[idx] = { ...files[idx], isOpen: !files[idx].isOpen }
        setFiles(newFiles)
    }

    function newAt(ev: React.MouseEvent<HTMLButtonElement, MouseEvent>, dir: File, type: "file" | "dir") {
        ev.preventDefault()
        ev.stopPropagation()

        setInputOpen({ open: true, type })
        setSelectedDir(dir)
    }

    async function remove(ev: React.MouseEvent<HTMLButtonElement, MouseEvent>, id: string) {
        ev.preventDefault()
        ev.stopPropagation()

        const encodedId = encodeURIComponent(id)

        const res = await fetch(`/remove/${encodedId}`, {
            method: "delete",
            headers: {
                "Content-Type": "application/json"
            }
        })
        const json = await res.json()

        console.log(json)
    }

    async function getFileContent(id: string) {
        const encodedId = encodeURIComponent(id)
        const res = await fetch(`/getcontent/${encodedId}`, {
            method: "get",
        })
        const content = await res.text()

        setFileId(id)
        setContent(content)
    }

    function renderIt(file: File, isChild: boolean) {
        return (
            <>
                {file.isDir ? (
                    <li className="dir" key={file.id} onClick={() => toggleOpen(file.id)}>
                        <span className={isChild ? "child" : ""}>
                            {file.isOpen ? <ChevronDownIcon /> : <ChevronRightIcon />}
                            {file.name}
                        </span>
                        <div style={{ display: "flex", gap: "2px" }}>
                            <button className="removebtn" onClick={(ev) => remove(ev, file.id)}><Trash2Icon size={20} /></button>
                            <button className="newbtn" onClick={(ev) => newAt(ev, file, "file")}>
                                <FilePlusIcon />
                            </button>
                            <button className="newbtn" onClick={(ev) => newAt(ev, file, "dir")}>
                                <FolderPlusIcon />
                            </button>
                        </div>
                    </li>
                ) : (
                    <li key={file.id} className="file" onClick={(ev) => getFileContent(file.id)}>
                        <span>{file.name}</span>
                        <button className="removebtn" onClick={(ev) => remove(ev, file.id)}>
                            <Trash2Icon size={20} />
                        </button>
                    </li>
                )}
            </>
        )
    }

    function isParentOpen(id: string): boolean {
        const lastSlashIndex = id.lastIndexOf("/")

        if (lastSlashIndex === -1) return true //it's a root level file

        const parentId = id.substring(0, lastSlashIndex)
        const parent = files?.find((file) => parentId === file.id) //get parent     

        return parent?.isOpen ? isParentOpen(parent.id) : false //check parent dirs recursively
    }

    async function createFile(dirId: string) {
        try {
            const res = await fetch("/create", {
                method: "post",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    name: input,
                    parent: dirId,
                    isDir: input === "dir"
                })
            })
            const json = await res.json()

            setInput("")
            setInputOpen({ open: false, type: "file" })
        } catch (err) {
            console.error(err)
        }
    }

    return (
        <aside>
            <h1>Your Folder</h1>
            <div className="top">
                {inputOpen.open ? (
                    <form onSubmit={(ev) => {
                        ev.preventDefault()
                        createFile(selectedDir?.id || "")
                    }}>
                        <span>new {inputOpen?.type} at {selectedDir ? selectedDir.name : "root"}</span>
                        <div>
                            <input type="text" onChange={(ev) => setInput(ev.target.value)} />
                            <button style={{ padding: 0 }} onClick={() => {
                                setSelectedDir(null)
                                setInput("")
                                setInputOpen({ open: false, type: "file" })
                            }}>
                                <XIcon />
                            </button>
                            <button type="submit">Create</button>
                        </div>
                    </form>
                ) : (
                    <div style={{ display: "flex", gap: "8px" }}>
                        <button onClick={() => setInputOpen({ open: true, type: "file" })}><FilePlusIcon /></button>
                        <button onClick={() => setInputOpen({ open: true, type: "dir" })}><FolderPlusIcon /></button>
                    </div>
                )}
            </div>
            <ul>
                {files && files.map((file) => (
                    <Fragment key={file.id}>
                        {file.id.includes("/") && !isParentOpen(file.id) ? null : renderIt(file, file.id.includes("/"))}
                    </Fragment>
                )
                )}

            </ul>
        </aside >
    )
}