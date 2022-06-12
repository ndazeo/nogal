import React from 'react';
import './select.css'

const Select = (props) => {
    const [images, setImages] = React.useState([]);
    const { selectedImage, api, setSelectedImage } = props;

    React.useEffect(() => {
        api.getFiles().then(setImages);
    }, [api]);


    const handleSerieChange = (event) => {
        event.preventDefault();
        const image = images.find(image => image._id === event.target.dataset.id)
        setSelectedImage(image);
    };

    return (
        <div className="selectForm">
            <div className="seriesContainer">
                <div className="seriesList">
                    <ul>
                        {images && images
                            .sort((a, b) => a.name > b.name ? 1 : -1)
                            .map(image =>
                                <li key={image._id} className={selectedImage && selectedImage._id === image._id ? "selectedSerie" : null}>
                                    <a href={image._id} data-id={image._id} onClick={handleSerieChange}>{image.name}</a>
                                </li>
                            )}
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default Select;