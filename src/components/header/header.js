import { Input, Tabs } from 'antd'
import _ from 'lodash'
import PropTypes from 'prop-types'
import React, { Component } from 'react'

import './header.css'

export default class Header extends Component {
  constructor() {
    super()
    this.state = {
      label: '',
    }

    this.onLabelChange = (event) => {
      const { value } = event.target
      this.setState({ label: value })
      const { onSearch } = this.props
      onSearch(value)
    }

    this.onTabChange = (key) => {
      const { onRatedTab, onSearch } = this.props
      const { label } = this.state
      if (key === 'rated') {
        onRatedTab(key)
      } else if (key === 'search') {
        onSearch(label)
      }
    }
  }

  render() {
    const searchPanel = (
      <div className="search-panel" placeholder="Type to search...">
        <form className="search-panel__form">
          <Input onChange={_.debounce(this.onLabelChange, 550)} type="text" className="search-panel__input" />
        </form>
      </div>
    )
    const items = [
      { label: 'Search', key: 'search', children: searchPanel }, // remember to pass the key prop
      { label: 'Rated', key: 'rated' },
    ]

    return (
      <div className="header">
        <Tabs items={items} onChange={(key) => this.onTabChange(key)} />
      </div>
    )
  }
}
Header.defaultProps = {
  onSearch: () => {},
  onRatedTab: () => {},
}

Header.propTypes = {
  onSearch: PropTypes.func,
  onRatedTab: PropTypes.func,
}
