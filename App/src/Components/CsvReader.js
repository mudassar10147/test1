import React, { useState } from "react";

const CsvReader = (props) => {
    const [file, setFile] = useState();

    const fileReader = new FileReader();

    const handleOnChange = (e) => {
        setFile(e.target.files[0]);
        let tempFile = e.target.files[0];
        if (tempFile) {
            fileReader.onload = function (event) {
                let csvOutput = event.target.result;
                console.log(csvOutput);
                csvOutput = csvOutput.split("\n");
                csvOutput = csvOutput.map((row) => {
                    return row.split(",")
                });
                console.log(csvOutput);
                props.onSetHeaders(csvOutput[0])
                csvOutput.shift();
                props.onSetRows(csvOutput);
            };

            fileReader.readAsText(tempFile);
        }
    };

    const handleOnSubmit = (e) => {
        e.preventDefault();

        if (file) {
            fileReader.onload = function (event) {
                let csvOutput = event.target.result;
                console.log(csvOutput);
                csvOutput = csvOutput.split("\n");
                csvOutput = csvOutput.map((row) => {
                    return row.split(",")
                });
                console.log(csvOutput);
                props.onSetHeaders(csvOutput[0])
                csvOutput.shift();
                props.onSetRows(csvOutput);
            };

            fileReader.readAsText(file);
        }
    };

    return (
        <div>
            <form>
                <input
                    type={"file"}
                    id={"csvFileInput"}
                    accept={".csv"}
                    onChange={handleOnChange}
                />
            </form>
        </div>
    );
}

export default CsvReader;