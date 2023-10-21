import React, { useState } from "react";
import { Table } from "reactstrap";

const CsvTable = (props) => {

    return (
        <div>
            <Table size="sm" bordered striped>
                <thead>
                    <tr>
                    {
                        props.headings.length > 0 && props.headings.map((item, index) => {
                            return <th key={'headings_'+index}>{item}</th>
                        })
                    }
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        {
                            props.rows.length > 0 && props.rows[0].map((item, index) => {
                                return <td key={'rows_'+index}>{item}</td>
                            })
                        }
                    </tr>
                </tbody>
            </Table>
        </div>
    );
}

export default CsvTable;