import React, { Component } from 'react';
import productSearch from '../api/productSearch';
import Product from './product';

class ProductSearchBar extends Component {
    constructor() {
        super();

        this.state = {
            query: "",
            results: []
        }
        this.searchTimeout = 0
    }

    runSearch(){
        if ( this.state.query.length > 2 ) {
            productSearch({ keyword: this.state.query }).then( results => {
                this.setState({ results });
            });
        } else {
            this.setState({ results: [] });
        }
    }

    updateQuery( newQuery ) {
        // Immediatly clear query when emptied
        if ( newQuery === "" ) {
            this.setState({ query: newQuery }, ()=>this.runSearch());
            return;
        }

        // Only run search once the user has stopped typing for half a second
        if ( this.searchTimeout ) clearTimeout( this.searchTimeout )
        this.searchTimeout = setTimeout( ()=> {
            this.runSearch()
        }, 400);

        // TODO: Do the searching
        this.setState({ query: newQuery });
    }

    render() {
        console.log( this.state.results );
        return (
            <div className="search-page">
                <div className="search-bar">
                    <div className="icon" onClick={this.props.exitSearch}><span className="back-icon"></span></div>
                    <input
                        autoFocus
                        placeholder="Search for a product"
                        value={ this.state.query }
                        onChange={ e => this.updateQuery( e.target.value ) }
                    />
                </div>
                <div className="search-results">{ this.state.results.map( product =>
                    <Product
                        product={product}
                        onClick={product => {this.props.addProduct(product); this.props.exitSearch();} }
                        key={ product.name+product.brand } />
                )}</div>
            </div>
        )
    }
}

export default ProductSearchBar;