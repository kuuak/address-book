// Assets depedencies (Style & images)
import './form.css';

// React
import React from 'react';
import { Link, Route } from 'react-router-dom';
import PropTypes from 'prop-types';

// Helpers
import isNull from 'lodash.isnull';
import isEmpty from 'lodash.isempty';
import isFunction from 'lodash.isfunction';
import formatPrice from 'includes/formatPrice';
import formData2UrlEncoded from 'includes/formData2UrlEncoded';

export default class IngredientForm extends React.Component {

	constructor( props ) {
		super( props );

		this.state = {
			name	: this.props.name,
			price	: ( 0 == this.props.price ? '' : this.props.price.toFixed(2) ),
		};

		this.handleSubmit = this.handleSubmit.bind( this );
		this.handleChangeName = this.handleChangeName.bind( this );
		this.handleChangePrice = this.handleChangePrice.bind( this );
	}

	componentWillReceiveProps( nextProps ) {
		if ( this.props._id != nextProps._id ) {
			this.setState({
				_id		: nextProps._id,
				name	: nextProps.name,
				price	: ( 0 == nextProps.price || isNull(nextProps.price) ? '' : nextProps.price.toFixed(2) ),
			})
		}
	}

	handleSubmit( event ) {
		event.preventDefault();

		let form = event.target,
				data = new FormData( form );

		for( let field of form.querySelectorAll( '.invalid' ) ) {
			field.classList.remove( 'invalid' );
		}

		fetch( form.action, {
			method: ( isNaN(this.props._id) ? 'POST' : 'PUT' ),
			body: formData2UrlEncoded( data ),
			headers: new Headers({ 'Content-Type': 'application/x-www-form-urlencoded' }),
		} )
		.then( res => res.json() )
		.then( res => {

			if ( ! isEmpty(res.alerts) ) {
				this.props.addAlerts( res.alerts );
			}

			if ( ! isEmpty(res.fields) ) {
				for (let fieldName of res.fields) {
					form.querySelector( `[name="${fieldName}"]` ).classList.add( 'invalid' );
				}
			}

			if ( res.success ) {
				this.setState({
					name: '',
					price: '',
				});
				form.elements[0].focus();

				if ( isFunction( this.props.onSubmitSuccess ) ) {
					this.props.onSubmitSuccess( res.ingredient || null, isNaN(this.props._id) ? 'POST' : 'PUT' );
				}
			}
		} );
	}

	handleChangeName( event ) {
		this.setState({ name: event.target.value });
	}

	handleChangePrice( event ) {
		this.setState({ price: formatPrice( event.target.value ) });
	}

	render() {
		return (
			<form method="POST" action="/ingredient/" className="add-ingredient-form" onSubmit={ this.handleSubmit }>
				<input type="text" name="name" className="name" placeholder="Ajouter un supplément" value={ this.state.name } onChange={ this.handleChangeName } autoComplete="off" required />
				<input type="text" name="price" className="price" placeholder="Prix" value={ this.state.price } pattern="\d+(\.\d{1,2})?" onChange={ this.handleChangePrice } autoComplete="off" />
				{ !isNaN(this.props._id) && <input type="hidden" name="_id" value={ this.props._id } /> }
				<button type="submit" className="btn blue">{ (isNaN(this.props._id) ? 'Ajouter' : 'Modifier') }</button>
			</form>
		);
	}
}
IngredientForm.PropTypes = {
	_id							: PropTypes.number,
	name						: PropTypes.string,
	price						: PropTypes.number,
	addAlerts				: PropTypes.func.isRequired,
	onSubmitSuccess	: PropTypes.func,
};
IngredientForm.defaultProps = {
	name	: '',
	price	: 0,
}
