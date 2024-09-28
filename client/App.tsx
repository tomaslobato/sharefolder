import { ChevronDownIcon, ChevronRightIcon, FilePlus, FilePlusIcon, FolderPlusIcon, PlusIcon, XIcon } from "lucide-react"
import React from "react"

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

export default function App() {
    const [files, setFiles] = React.useState<File[] | null>(null)
    const [error, setError] = React.useState<string | null>(null)
    const [inputOpen, setInputOpen] = React.useState<InputOpen>({ open: false, type: "file" })
    const [input, setInput] = React.useState("")
    const [selectedDir, setSelectedDir] = React.useState<File | null>(null)

    React.useEffect(() => {
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

    function renderIt(file: File, isChild: boolean) {
        return (
            <>
                {file.isDir ? (
                    <li className="dir" key={file.id} onClick={() => toggleOpen(file.id)}>
                        <span className={isChild ? "child" : ""}>
                            {file.isOpen ? <ChevronDownIcon /> : <ChevronRightIcon />}
                            {file.name}
                        </span>
                        <div>
                            <button className="newbtn" onClick={(ev) => newAt(ev, file, "file")}>
                                <FilePlusIcon />
                            </button>
                            <button className="newbtn" onClick={(ev) => newAt(ev, file, "dir")}>
                                <FolderPlusIcon />
                            </button>

                        </div>
                    </li>
                ) : (
                    <li key={file.id}>{file.name}</li>
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
            console.log(json)

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
                    <React.Fragment key={file.id}>
                        {file.id.includes("/") && !isParentOpen(file.id) ? null : renderIt(file, file.id.includes("/"))}
                    </React.Fragment>
                )
                )}

            </ul>
        </aside >
    )
}