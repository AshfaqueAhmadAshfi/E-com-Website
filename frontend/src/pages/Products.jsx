import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getProductsAPI, getCategoriesAPI } from '../utils/api.js';
import ProductCard from '../components/ProductCard.jsx';
import { FiSearch, FiFilter } from 'react-icons/fi';

const Products = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [pagination, setPagination] = useState({});
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState(searchParams.get('search') || '');
    const [filters, setFilters] = useState({
        category: searchParams.get('category') || '',
        sort: searchParams.get('sort') || '-createdAt',
        minPrice: searchParams.get('minPrice') || '',
        maxPrice: searchParams.get('maxPrice') || '',
        featured: searchParams.get('featured') || '',
        page: searchParams.get('page') || 1
    });

    useEffect(() => { getCategoriesAPI().then(r => setCategories(r.data.categories || [])).catch(() => { }); }, []);

    // Sync from URL params
    useEffect(() => {
        setFilters({
            category: searchParams.get('category') || '',
            sort: searchParams.get('sort') || '-createdAt',
            minPrice: searchParams.get('minPrice') || '',
            maxPrice: searchParams.get('maxPrice') || '',
            featured: searchParams.get('featured') || '',
            page: Number(searchParams.get('page')) || 1
        });
        setSearch(searchParams.get('search') || '');
    }, [searchParams]);

    useEffect(() => {
        setLoading(true);
        const params = { ...filters };
        if (search) params.search = search;
        Object.keys(params).forEach(k => { if (!params[k]) delete params[k]; });
        getProductsAPI(params).then(r => {
            setProducts(r.data.products || []);
            setPagination(r.data.pagination || {});
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }).catch(() => { }).finally(() => setLoading(false));
    }, [filters, search]);

    const handleSearch = (e) => {
        e.preventDefault();
        const newParams = new URLSearchParams(searchParams);
        if (search) newParams.set('search', search); else newParams.delete('search');
        newParams.set('page', '1');
        setSearchParams(newParams);
    };

    const handleFilter = (key, val) => {
        const newParams = new URLSearchParams(searchParams);
        if (val) newParams.set(key, val); else newParams.delete(key);
        if (key !== 'page') newParams.set('page', '1');
        setSearchParams(newParams);
    };

    return (
        <div className="page">
            <div className="container">
                <div style={{ marginBottom: '32px' }}>
                    <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '8px' }}>All Products</h1>
                    <p style={{ color: 'var(--text-secondary)' }}>Discover our amazing collection of products</p>
                </div>

                {/* Search & Filters */}
                <div style={{ display: 'flex', gap: '12px', marginBottom: '24px', flexWrap: 'wrap' }}>
                    <form onSubmit={handleSearch} style={{ flex: '1 1 300px', display: 'flex', gap: '8px' }}>
                        <div style={{ flex: 1, position: 'relative' }}>
                            <FiSearch style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                            <input className="form-input" placeholder="Search products..." value={search} onChange={e => setSearch(e.target.value)}
                                style={{ paddingLeft: '40px' }} />
                        </div>
                        <button type="submit" className="btn btn-primary">Search</button>
                    </form>
                    <select className="form-input form-select" value={filters.category} onChange={e => handleFilter('category', e.target.value)} style={{ width: '180px' }}>
                        <option value="">All Categories</option>
                        {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                    </select>
                    <select className="form-input form-select" value={filters.sort} onChange={e => handleFilter('sort', e.target.value)} style={{ width: '180px' }}>
                        <option value="-createdAt">Newest First</option>
                        <option value="price">Price: Low to High</option>
                        <option value="-price">Price: High to Low</option>
                        <option value="-ratings">Top Rated</option>
                        <option value="-sold">Best Selling</option>
                    </select>
                </div>

                {/* Results */}
                {loading ? (
                    <div className="loading-page"><div className="spinner" /><p style={{ color: 'var(--text-muted)' }}>Loading products...</p></div>
                ) : products.length === 0 ? (
                    <div className="empty-state"><div className="empty-icon">🔍</div><h3>No products found</h3><p>Try adjusting your search or filters</p></div>
                ) : (
                    <>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '16px' }}>{pagination.total} products found</p>
                        <div className="products-grid">{products.map(p => <ProductCard key={p._id} product={p} />)}</div>
                        {pagination.pages > 1 && (
                            <div className="pagination">
                                {[...Array(pagination.pages)].map((_, i) => (
                                    <button key={i} className={pagination.page === i + 1 ? 'active' : ''} onClick={() => handleFilter('page', i + 1)}>{i + 1}</button>
                                ))}
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default Products;
