import { useState, useRef } from 'react';
import FileInput from './components/FileInput';
import Photos from './components/Photos';

export default function App() {
    const [selectedFile, setSelectedFile] = useState(null);
    const [isFileSelected, setIsFileSelected] = useState(false);
    const [photos, setPhotos] = useState([]);
    const [showSpinner, setShowSpinner] = useState(false);

    const fileInputRef = useRef(null);

    const updatePhotosAndStorage = newPhoto => {
        const updatedPhotos = [...photos, newPhoto];
        setPhotos(updatedPhotos);
        localStorage.setItem('photos', JSON.stringify(updatedPhotos));
    };

    const handlePhotosUpdate = data => {
        setPhotos(data);
    };

    const handleInputChange = e => {
        const file = e.target.files[0];
        setSelectedFile(file);
        setIsFileSelected(!!file);
    };

    const handleFileUpload = async () => {
        setShowSpinner(true);
        const formData = new FormData();
        formData.append('file', selectedFile, selectedFile.name);

        const response = await fetch(
            import.meta.env.VITE_API_BASE_URL + '/photos',
            {
                method: 'POST',
                body: formData,
            },
        );

        if (response.ok) {
            const data = await response.json();
            updatePhotosAndStorage(data);
        }
        fileInputRef.current.value = '';
        setIsFileSelected(false);
        setShowSpinner(false);
    };

    return (
        <div>
            <FileInput
                fileInputRef={fileInputRef}
                onInputChange={handleInputChange}
                onFileUpload={handleFileUpload}
                isFileSelected={isFileSelected}
                showSpinner={showSpinner}
            />
            <Photos photos={photos} onUpdatePhotos={handlePhotosUpdate} />
        </div>
    );
}
