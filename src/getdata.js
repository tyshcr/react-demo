import React from 'react'
import moment from 'moment'

export default class GetData extends React.Component {

  constructor(state) {
    super()
    this.state = {
      result: null,
      error: null,
      isLoading: true
    }
  }

  componentDidMount() {
    const selected_start_date = this.props.startdate
    const selected_end_date = this.props.enddate
    this.start_date = moment(selected_start_date, 'YYYY-MM-DD')
    this.start_month = this.start_date.format('M')
    this.end_date = moment(selected_end_date, 'YYYY-MM-DD')
    this.getData()
  }


  getData() {
    fetch("/api/data.json")
            .then(r => r.json())
            .then(r => {
              r.sort((a,b) => { // sort the data by customer_id and then by date
                if (a.customer_id  === b.customer_id) {
                  if (a.date > b.date) return 1
                  if (a.date < b.date) return -1
                  return 0
                } else {
                  return a.customer_id - b.customer_id
                }
              })
              // use a short timeout for this demo so we can see state change
              setTimeout(function() {
                const points_data = this.calculate(r)
                this.setState({ result: points_data, isLoading: false })
              }.bind(this), 1500)
            },
            e => {
              this.setState({ error: e, isLoading: false})
            })

  } // getData

  calculate(array) {
    let data = []
    let points = []
    let customer_id = 0
    let previous_date = 0
    let previous_month = 0
    let transaction_month = 0
    let subtotal = 0

    array.forEach((transaction) => {
      let transaction_date = moment(transaction.date, 'YYYY-MM-DD')
      if (transaction_date >= this.start_date && transaction_date <= this.end_date) {

        // get the month of the current transaction
        transaction_month = transaction_date.format('M')

        if (customer_id !== transaction.customer_id) {
          // working with a new customer_id
          if (customer_id > 0) {
            points = this.addTrailingMonths(points, subtotal)
            data.push({ customer_id: customer_id, points: points }) // push the previous customer onto the array
          }


          // reset everything for this new customer
          customer_id = transaction.customer_id
          previous_date = transaction_date
          previous_month = transaction_month
          points = []
          subtotal = 0

          points = this.addLeadingMonths(transaction_date)

          if (transaction_date >= this.start_date && transaction_date <= this.end_date) {
            subtotal = transaction.amount > 0 ? this.getPoints(transaction.amount) : 0
          }
        } else {

          if (transaction_month !== previous_month) {

            // working with a new month
            if (transaction_month > 0) {

              points.push(subtotal) // push the previous month onto the array
              subtotal = 0 // reset the subtotal

              // probably a better IF for this but accounting for Nov and Jan with no Dec transactions
              if ((transaction_month - previous_month > 1 && transaction_month != 1) ||
                  (transaction_month - previous_month < 0 && transaction_month == 1 && previous_month != 12)) {
                points.push(0)
              }
            }
            previous_date = transaction_date
            previous_month = transaction_month // set the current month
          }

          // add to the current subtotal (customer.points[x])
          subtotal += this.getPoints(transaction.amount)
        }
      }
    })

    points = this.addTrailingMonths(points, subtotal)
    data.push({ customer_id: customer_id, points: points }) // push the last customer onto the data array
    return data
  }

  addLeadingMonths(transaction_date) {
    // this is for customers who made no purchases in earlier months but did in later months
    let points = []
    let month_difference = moment(this.start_date).diff(transaction_date, 'months')
    if (month_difference < 0) {
      for(let x=month_difference; x < 0; x++) {
        points.push(0)
      }
    }
    return points
  }

  addTrailingMonths(points, subtotal) {
    // this is for customers who made purchases in earlier months but not in later months
    points.push(subtotal)
    for (let total_months = Math.ceil(moment(this.end_date).diff(this.start_date, 'months', true)); total_months > points.length; total_months-1) {
      points.push(0)
    }
    return points
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
    if (!this.state.isLoading) {
      if(this.state.result)  {
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
      } else if (this.state.error) {
        return "There was an error: " + this.state.error
      }
    } else {
        return "Loading Data ..."
    }

  } //render()

}
