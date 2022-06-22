import { useEffect, useState, useContext } from 'react';
import { APIContext } from '../../Services/api';
import Loading from '../../Components/loading';
import File from './file';

const Files = (props) => {
    const { api } = useContext(APIContext)
    const [files, setFiles] = useState([]);
    const [fileid, setFileId] = useState(null);
    const [file, setFile] = useState(null);

    useEffect(() => {
        if(!fileid)
            setFile(null)
        else if(fileid === 'new')
            setFile({groups:[]})
        else
            setFile(files.find(f => f._id === fileid))
    }, [fileid, files])


    useEffect(() => {
        api.getFiles().then(files => setFiles(files))
    }, [api])


    const handleFileSelect = (event) => {
        event.preventDefault();
        setFileId(event.target.dataset.id);
    };

    const handleFileClose = (event) => {
        api.getFiles().then(files => setFiles(files))
        setFileId(null);
    }

    const handleNewClick = (event) => {
        setFileId('new')
    }

    return (
        <div>
            <ul>
            {
                files.map(file => {
                    return (
                    <li key={file._id}>{file.name} &nbsp;
                        <div className="fa-solid fa-pen-to-square nogal-btn" data-id={file._id} onClick={handleFileSelect}></div>
                    </li>
                    )
                })
            }
            </ul>
            <div className="fa-solid fa-plus nogal-btn" onClick={handleNewClick}></div>
            <Loading visible={fileid && !file} full={true} />
            {file && <File file={file} api={api} onClose={handleFileClose} setFile={setFile} />}
        </div>
    )
}

export default Files;