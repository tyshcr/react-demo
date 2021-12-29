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

    const doCall = () => fetch("/api/data.json").then(r => r.json())

    doCall().then(
      r => {
        // add a timeout for this demo, so we can see the state changes
        setTimeout(function() {
          this.setState({ result: r, isLoading: false })
        }.bind(this), 1500)
      },
      e => {
        // add a timeout for this demo, so we can see the state changes
        setTimeout(function() {
          this.setState({ error: e, isLoading: false })
        }.bind(this), 1500)
      }
    )

  } // getData

  render() {
    // TODO: check for state.error
    if (!this.state.isLoading) {
      return (
        <table border="1">
          <thead>
            <tr>
              <td>ID</td>
              <td>Date</td>
              <td>Amount</td>
            </tr>
          </thead>

          <tbody>
          {this.state.result.transactions.map(r =>
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
