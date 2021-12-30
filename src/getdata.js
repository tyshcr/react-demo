import React from 'react';
import moment from 'moment'

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
    fetch("/api/data.json")
            .then(r => r.json())
            .then(r => {
              r.sort((a,b) => { // sort the data by customer_id and then by date
                if (a.customer_id  === b.customer_id) {
                  if (a.date > b.date) return 1;
                  if (a.date < b.date) return -1;
                  return 0;
                } else {
                  return a.customer_id - b.customer_id
                }
              })
              // use a short timeout for this demo so we can see state change
              setTimeout(function() {
                const  data = this.calculate(r)
                this.setState({ result: data, isLoading: false })
              }.bind(this), 1500)
            })

  } // getData

  calculate(array) {
    let data = []
    let points = []
    let customer_id = 0
    let month = 0
    let thismonth = 0
    let subtotal = 0


    array.map((transaction) => {

      let date = moment(transaction.date, 'MM-DD-YYYY')
      thismonth = date.format('M')

      if (customer_id !== transaction.customer_id) {
        // working with a new customer_id
        if (customer_id > 0) {
          // TODO what if a customer did not shop during X month ?
          points.push(subtotal)
          data.push({ customer_id: customer_id, points: points }); // push the previous customer onto the array
        }

        // reset everything for new customer
        customer_id = transaction.customer_id
        month = thismonth
        points = []

        subtotal = transaction.amount > 0 ? this.getPoints(transaction.amount) : 0;
      } else {

        if (thismonth !== month) {
          // working with a new month
          if (thismonth > 0) {
            points.push(subtotal) // push the previous month onto the array
            subtotal = 0 // reset the subtotal
          }
          month = thismonth // set the current month
        }

        // add to the current subtotal (customer.points[x])
        subtotal += this.getPoints(transaction.amount);
      }
    })

    points.push(subtotal) // push the last points onto the points array
    data.push({ customer_id: customer_id, points: points }); // push the last customer onto the data array
    return data
  }

  getPoints(dollars) {
    if (dollars > 49.99 && dollars < 100.00) {
      return Math.floor(dollars - 50)
    }  else if (dollars > 99.99) {
      return (Math.floor(dollars - 100) * 2) + 50
    }
    return 0
  }

  render() {

    // TODO: check for state.error
    if (!this.state.isLoading) {
      return (
        <table border="1">
          <thead>
            <tr>
              <td>Cust ID</td>
              <td>Month 1</td>
              <td>Month 2</td>
              <td>Month 3</td>
              <td>Total</td>
            </tr>
          </thead>

          <tbody>
          {this.state.result.map(r =>
                                  <tr key={r.customer_id}>
                                    <td>{r.customer_id}</td>
                                    <td>{r.points[0]}</td>
                                    <td>{r.points[1]}</td>
                                    <td>{r.points[2]}</td>
                                    <td>{r.points.reduce((prev, cur, index)=>prev+cur, 0)}</td>
                                  </tr>
                                )}
          </tbody>
        </table>
      )
    } else { // not currently accounting for possible data fetch errors
        return "Loading Data ..."
    }

  } //render()

}
