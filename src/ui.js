import React from 'react';
import GetData from './getdata'

export default class UserInterface extends React.Component {

  constructor(props) {
    super(props);
    // create a UI to select the startdate and enddate
    this.state = {startdate: '2021-10-01', enddate: '2021-12-31'};
    // this.state = {startdate: '2021-11-01', enddate: '2022-01-31'};
  }

  render()  {
    return(
      // pass the startdate and enddate to GetData
      <GetData startdate={this.state.startdate} enddate={this.state.enddate}/>
    )
  }
}
