// Assets depedencies (Style & images)
import './index.css';

// React
import React from 'react';
import { Link, Route } from 'react-router-dom';
import PropTypes from 'prop-types';
import CSSTransitionGroup from 'react-transition-group/CSSTransitionGroup';


// Components
import Gmap from 'components/ui-Gmap';
import Address from 'components/ui-Address';
import AddressForm from 'components/ui-CustomerForm/address';
import CustomerFormDetails from 'components/ui-CustomerForm/details';

// Helpers
import isEmpty from 'lodash.isempty';
import isFunction from 'lodash.isfunction';

class Customer extends React.Component {

	constructor( props ) {
		super( props );

		this.state = {
			phone				: '',
			gender			: null,
			firstname		: '',
			lastname		: '',
			email				: null,
			addresses		: [],
			showSidebar	: false,
			loading			: true,
		};

		this.openSidebar		= this.openSidebar.bind( this );
		this.closeSidebar		= this.closeSidebar.bind( this );
		this.deleteCustomer	= this.deleteCustomer.bind( this );

		this.Gmap					= this.Gmap.bind( this );
	}

	componentDidMount() {
		this.getCustomer( () => {
			if ( this.props.location.pathname.match( /\/edit|add|directions\/?/ ) ) {
				this.openSidebar();
			}
		} );
	}

	getCustomer( callback ) {

		this.setState({ loading: true });
		fetch( `/customer/${this.props.id}/`, { headers: new Headers({ 'Accept': 'application/json' }) } )
			.then( res => res.json() )
			.then ( res => {

				if ( res.alerts ) {
					this.props.addAlerts( res.alerts );
				}

				if ( res.success ) {
					this.setState( res.customer );

					if ( isFunction(callback) ) {
						callback();
					}

					this.setState({ loading: false });
				}
			} );
	}

	deleteCustomer( event ) {
		if ( window.confirm("Êtes-vous sûr de vouloir supprimer cet client ?") ) {
			fetch( `/customer/${this.props.id}/`, { method: 'DELETE'} )
				.then( res => res.json() )
				.then( res => {
					if ( res ) {

						if ( ! isEmpty(res.alerts) ) {
							this.props.addAlerts( res.alerts );
						}

						if ( res.success ) {
							this.props.history.push( `/customers/` );
						}
					}
				} );
		}
		else {
			event.preventDefault();
		}
	}

	openSidebar() {

		if ( ! this.state.showSidebar ) {
			this.setState({
				showSidebar: true,
			});
		}
	}

	closeSidebar( refreshData ) {
		this.setState({
			showSidebar: false,
		});

		if ( refreshData || false ) {
			this.getCustomer();
		}
	}

	deleteAddress( addrId, event ) {
		if ( window.confirm("Êtes-vous sûr de vouloir supprimer cette adresse ?") ) {
			fetch( `/customer/${this.props.id}/address/${addrId}/`, { method: 'DELETE'} )
				.then( res => res.json() )
				.then( res => {
					if ( res ) {

						if ( ! isEmpty(res.alerts) ) {
							this.props.addAlerts( res.alerts );
						}

						this.closeSidebar( true );
						this.props.history.push( `/customer/${this.props.id}/` );
					}
				} );
		}
		else {
			event.preventDefault();
		}
	}

	Gmap({ match }) {
		return <Gmap custId={ this.props.id } addrId={ parseInt(match.params.addrId) } addAlerts={this.props.addAlerts} />;
	}

	render() {
		const submitSuccess = () => {
			this.closeSidebar( true );
			this.props.history.push( `/customer/${this.props.id}/` );
		};
		const addressForm = ({ match }) => {
			return <AddressForm id={ parseInt(match.params.addrId) } custId={ parseInt(match.params.custId) } addAlerts={ this.props.addAlerts } onSubmitSucess={ submitSuccess } />;
		};
		const customerForm = ({ match, history }) => {
			return <CustomerFormDetails id={ parseInt(match.params.custId) } addAlerts={ this.props.addAlerts } onSubmitSucess={ submitSuccess } />;
		};

		return (
			<div className="customer">
				<div className="customer-details">
					<div className="card">
						<div className="card-content">
							<h1 className="card-title">{ this.state.phone }</h1>
							<h2>
								{ `${this.state.firstname} ${this.state.lastname}`  }
								<small> ({( 'mr' === this.state.gender ? 'Monsieur' : 'Madame' )})</small>
							</h2>
							{ !isEmpty(this.state.email) && <p className="email"><a href={`mailto:${this.state.email}`}>{ this.state.email }</a></p> }
							<h3>Adresses</h3>
							<CSSTransitionGroup component="ul" className="addresses collection" transitionName={{ enter: 'add', leave: 'delete' }} transitionEnterTimeout={300} transitionLeaveTimeout={300}>
								{ this.state.addresses.map( (addr) => <Address key={addr.id} custId={this.props.id} {...addr} openSidebar={this.openSidebar} deleteAddress={this.deleteAddress.bind(this, addr.id)} /> ) }
							</CSSTransitionGroup>
						</div>
						<div className="card-action">
							<Link to={ `/customer/${this.props.id}/edit/` } onClick={ this.openSidebar } >Modifier</Link>
							<Link to={ `/customer/${this.props.id}/address/add/` } onClick={ this.openSidebar } >Ajouter une adresse</Link>
							<Link to={ `/customer/${this.props.id}/delete/` }  className="red-text right" onClick={ this.deleteCustomer } >Supprimer</Link>
						</div>
					</div>
				</div>
				<aside className={ 'white'+  ( this.state.showSidebar ? ' open' : '' ) }>
					<Link to={ `/customer/${this.props.id}/` } className="close" onClick={ this.closeSidebar }>
						<i className="material-icons small">close</i>
					</Link>
					<Route exact path="/customer/:custId/edit/" render={ customerForm } />

					<Route exact path="/customer/:custId/address/add/" component={ addressForm } />
					<Route exact path="/customer/:custId/address/:addrId/edit/" component={ addressForm } />

					<Route exact path="/customer/:custId/address/:addrId/directions/" render={ this.Gmap } />
				</aside>
			</div>
		);
	}

}
Customer.propTypes = {
	id				: PropTypes.number.isRequired,
	addAlerts	: PropTypes.func.isRequired,
	history		: PropTypes.object.isRequired,
};

export default Customer;
