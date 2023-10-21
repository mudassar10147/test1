import Layout from '../Components/Layout';
import CsvReader from '../Components/CsvReader';
import React, { useEffect, useState } from 'react';
import { Button, Col, Container, Input, Row, Table } from 'reactstrap';
import CsvTable from '../Components/CsvTable';
import { httpRequest } from '../Helpers/Http';
import { CSVLink } from "react-csv";
import moment from "moment";

const Home = () => {
  const [templateHeaders, setTemplateHeaders] = useState([]);
  const [templateRows, setTemplateRows] = useState([]);
  const [sourceHeaders, setSourceHeaders] = useState([]);
  const [sourceRows, setSourceRows] = useState([]);
  const [selectedHeaders, setSelectedHeaders] = useState(null);
  const [csvData, setCsvData] = useState([]);

  const updateHeader = (e, key)=> {
    let value = e.target.value;
    console.log(value, key);
    if(value && value.length > 0){
      let temp = {...selectedHeaders};
      temp[key] = value;
      setSelectedHeaders(temp);
    }
  }

  useEffect(()=>{
    console.log("Template Headers", templateHeaders);
  }, [templateHeaders])

  useEffect(()=>{
    console.log("Source Headers", sourceHeaders);
  }, [sourceHeaders])

  const compareHeadings = async () => {
    let requestData = {
      template_headings: templateHeaders, 
      template_rows: templateRows[0], 
      source_headings: sourceHeaders,
      source_rows: sourceRows[0]
    };

    let response = await httpRequest(requestData, 'compare');
    setSelectedHeaders(response)
    console.log(response);
  }
  useEffect(()=>{
    if(templateHeaders.length > 0 && templateRows.length > 0 && sourceHeaders.length > 0 && sourceRows.length > 0){
      compareHeadings()
    }
  }, [templateHeaders, templateRows, sourceHeaders, sourceRows])

  useEffect(()=>{
    console.log("Selected Header");
    if(selectedHeaders){
      let dataToAppend = [];
      sourceRows.map((row) => {
        let tempRow = [];
        Object.keys(selectedHeaders).map((key)=>{
          let idx = sourceHeaders.indexOf(selectedHeaders[key]);
          let value = row[idx];
          if(value){
            if(key == "Date"){
              value = moment(value).format("DD-MM-YYYY");
              console.log("Date", value);
            }else if(key == "Premium"){
              value = parseInt(value);
            }else if(key == "PolicyNumber"){
              value = value.replace("-", "")
            }else if(key == "Plan"){
              console.log("Plan", value);
              if(value.indexOf("Gold")>-1){
                value = "Gold";
              }else if(value.indexOf("Silver")>-1){
                value = "Silver";
              }else if(value.indexOf("Bronze")>-1){
                value = "Bronze";
              }
            }
          }
          tempRow.push(value)
        })
        if(tempRow.length == templateHeaders.length){
          dataToAppend.push(tempRow);
        }
      });
      let existingData = [];
      [...templateRows].forEach(row => {
        if(row.length == templateHeaders.length){
          existingData.push(row);
        }
      })

      let data = [templateHeaders, ...existingData, ...dataToAppend];
      console.log("Selected Data", data)
      setCsvData(data);
    }
  }, [selectedHeaders])

  return (
    <>
      <Container>
        <Row>
          <Col>
            <h3>Step 1</h3>
            <p>Choose template file for target formatting</p>
            <CsvReader onSetHeaders={(e)=>setTemplateHeaders(e)} onSetRows={(e)=>setTemplateRows(e)}></CsvReader>
            <br/>
            <CsvTable headings={templateHeaders} rows={templateRows}></CsvTable>
          </Col>
        </Row>
        { 
          templateHeaders.length > 0 &&
          <Row>
            <Col>
              <h3>Step 2</h3>
              <p>Choose source file to map data</p>
              <CsvReader onSetHeaders={(e)=>setSourceHeaders(e)} onSetRows={(e)=>setSourceRows(e)}></CsvReader>
              <br/>
              <CsvTable headings={sourceHeaders} rows={sourceRows}></CsvTable>
            </Col>
          </Row>
        }

        { 
          sourceHeaders.length > 0 &&
          <Row>
            <Col>
              <h3>Step 3</h3>
              <p>Confirm if we have mapped it correctly</p>
              {
                selectedHeaders != null ?
                <Table  size="sm" bordered striped>
                  <tbody>
                    <tr>
                      <th>Template Headings</th>
                      {
                        Object.keys(selectedHeaders).map(key => {
                          return <td>{key}</td>
                        })
                      }
                    </tr>
                    <tr>
                      <th>Matched Source Headings</th>
                      {
                        Object.keys(selectedHeaders).map(key => {
                          return <td>
                            
                            <Input
                              name="select"
                              type="select"
                              value={selectedHeaders[key]}
                              onChange={(e)=>updateHeader(e, key)}
                            >
                              { 
                                sourceHeaders.map(item => {
                                  return <option>{item}</option>
                                })
                              }
                            </Input>
                            </td>
                        })
                      }
                    </tr>
                  </tbody>
                </Table> :
                <h4 className='text-center'>PROCESSING...</h4>
              }
              {
                csvData.length > 0 && <CSVLink className='btn btn-dark' filename={'target.csv'} data={csvData}>Export CSV</CSVLink>
              }
            </Col>
          </Row>
        }
      </Container>
    </>
  );
}

export default Home;