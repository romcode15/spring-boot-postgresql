package com.espe.product.dto;

import java.util.List;

public class PaginaResponse<T> {

    private List<T> contenido;
    private int paginaActual;
    private int totalPaginas;
    private long totalElementos;

    public PaginaResponse(List<T> contenido, int paginaActual,
                          int totalPaginas, long totalElementos) {
        this.contenido      = contenido;
        this.paginaActual   = paginaActual;
        this.totalPaginas   = totalPaginas;
        this.totalElementos = totalElementos;
    }

    public List<T> getContenido()        { return contenido; }
    public int getPaginaActual()         { return paginaActual; }
    public int getTotalPaginas()         { return totalPaginas; }
    public long getTotalElementos()      { return totalElementos; }
}
