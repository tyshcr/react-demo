import React, {useState, useEffect} from 'react';

export default class GetData extends React.Component {

  constructor(state) {
    super()
    this.state = {
      result: {},
      error: null,
      isLoading: true
    }
  } // constructor


  componentDidMount() {
    this.getData()
  }


  getData() {

    // const doCall = () =>
    fetch("/api/data.json")
            .then(r => r.json())
            .then(r => {
              r.sort((a,b) => {
                console.log("sort")
                if (a.customer_id  === b.customer_id) {
                  console.log("equals")
                  if (a.date > b.date) return 1;
                  if (a.date < b.date) return -1;
                  return 0;
                } else {
                  console.log("cust")
                  return a.customer_id - b.customer_id
                }
              })
              setTimeout(function() {
                this.setState({ result: r, isLoading: false })
              }.bind(this), 1500)
            })

  } // getData

  render() {

    // TODO: check for state.error
    if (!this.state.isLoading) {
      // this.calculate(this.state.result)

      return (
        <table border="1">
          <thead>
            <tr>
              <td>Cust ID</td>
              <td>Date</td>
              <td>Amount</td>
            </tr>
          </thead>

          <tbody>
          {this.state.result.map(r =>
                                  <tr key={r.id}>
                                    <td>{r.customer_id}</td>
                                    <td>{r.date}</td>
                                    <td>{r.amount}</td>
                                  </tr>
                                )}
          </tbody>
        </table>
      )
    } else {
        return "Loading Data ..."
    }

  } //render()

}
