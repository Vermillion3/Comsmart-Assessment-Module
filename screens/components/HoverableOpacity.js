import React, { Component } from 'react'
import { TouchableOpacity } from 'react-native'
import PropTypes from 'prop-types'

export default class HoverableOpacity extends Component {
  constructor(props) {
    super(props)
    this.state = { hover: false }
  }

  render() {
    const { outerStyle, hoverStyle, children, ...restProps } = this.props
    const { hover } = this.state

    return (
      <TouchableOpacity
        {...restProps}
        activeOpacity={1}
        style={[outerStyle, hover ? hoverStyle : null]}
        onMouseEnter={() => this.setState({ hover: true })}
        onMouseLeave={() => this.setState({ hover: false })}
      >
        {children}
      </TouchableOpacity>
    )
  }
}

HoverableOpacity.propTypes = {
  hoverStyle: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
  outerStyle: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
  children: PropTypes.node,
}