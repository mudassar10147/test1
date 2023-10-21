import React from 'react';
import {
    Navbar,
    NavbarBrand
} from 'reactstrap';


const Header =() =>{
    return(
        <Navbar color="dark" dark container>
            <NavbarBrand href="/">CsvLab</NavbarBrand>
        </Navbar>
    )
}

export default Header;