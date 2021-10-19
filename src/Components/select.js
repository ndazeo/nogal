import React from 'react';
import './select.css'

const Select = (props) => {
    const [patients, setPatients] = React.useState([]);
    const { serie, patient, api, onSerieSelected, onPatientSelected } = props;

    React.useEffect(() => {
        api.getPatients().then(setPatients);
    }, [api]);

    const handlePatientChange = (event) => {
        api.getPatient(event.target.value).then(onPatientSelected);
    };

    const handleSerieChange = (event) => {
        event.preventDefault();
        api.getSerie(event.target.dataset.id).then(onSerieSelected);
    };

    return (
        <div className="selectForm">
            <div>
                <label htmlFor="select">Patient </label>
                <select class="box" value={patient ? patient._id : null} onChange={handlePatientChange}>
                    <option value="">Select a patient</option>
                    {patients
                        .sort((a, b) => a.name > b.name? 1 : -1)
                        .map(ipatient =>
                            <option value={ipatient._id}>
                                {ipatient.name}
                            </option>
                        )}
                </select>
            </div>
            <label htmlFor="select">Serie</label>
            <div className="seriesContainer">
                <div className="seriesList">
                    <ul>
                        {patient && patient.series && patient.series
                            .sort((a, b) => a.name > b.name ? 1 : -1)
                            .map(iserie =>
                                <li className={serie && serie._id === iserie._id ? "selectedSerie" : null}>
                                    <a href={iserie._id} data-id={iserie._id} onClick={handleSerieChange}>{iserie.name}</a>
                                </li>
                            )}
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default Select;