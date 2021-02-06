/* Copyright 2018 Kevin Zatloual. All rights reserved. */

import React from 'react';


const TopBar = () => {
  return (
    <div className="navbar" style={{background: 'rgb(178,6,15)',
                                    marginBottom: '10px'}}>
      <span className="navbar-brand mb-0 h1" style={{color: 'white'}}>
        <img src="rw.png" height="40" width="40" alt="logo"
             style={{marginRight: '10px'}} />
        RotoWorkshop
      </span>
    </div>);
}

export default TopBar;
