import React from "react"

type File = {
    name: string
    isDir: boolean
    in: File[] | null
}

export default function App() {
    const [files, setFiles] = React.useState<File[]>([{ name: "opusk", isDir: false, in: null }])
    const [error, setError] = React.useState<string | null>(null)

    React.useEffect(() => {
        async function getFiles() {
            try {
                const res = await fetch("/getfiles")
                if (!res.ok) {
                    throw new Error("Failed to fetch files")
                }
                const json = await res.json()
                setFiles(json)
            } catch (err) {
                setError("Error loading files")
            }
        }

        getFiles()
    }, [])

    //render files recursively
    const renderFiles = (files: File[] | null) => {
        if (!files) return null

        return (
            <>
                {files.map((file, index) => (
                    <li key={index} className={file.isDir ? "folder" : "file"}>
                        <span style={{ fontSize: 20 }}>{file.name}</span>
                        {file.in && renderFiles(file.in)}
                    </li>
                ))}
            </>
        )
    }

    if (error) {
        return <h3>{error}</h3>
    }

    return (
        <ul className="main-list">
            {files ? renderFiles(files) : <h3>Loading files...</h3>}
        </ul>
    )
}