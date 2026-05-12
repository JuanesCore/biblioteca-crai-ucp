import React from "react";

const SearchBar = ({ value, onChange, onSearch, loading, placeholder }) => {
  return (
    <form className="crai-search-form" onSubmit={onSearch}>
      <input
        className="crai-search-input"
        name="title"
        type="search"
        value={value}
        onChange={onChange}
        placeholder={placeholder || "Escribe para buscar..."}
        autoComplete="off"
      />
      <button className="crai-search-btn" type="submit" disabled={loading}>
        {loading ? "Buscando..." : "Buscar"}
      </button>
    </form>
  );
};

export default SearchBar;

