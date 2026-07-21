package com.espe.product.repository;

import com.espe.product.entity.Producto;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ProductoRepository extends JpaRepository<Producto, Long> {

    // ── Consultas que filtran solo activos ──
    Page<Producto> findByActivoTrue(Pageable pageable);
    List<Producto> findByActivoTrue();

    Page<Producto> findByNombreContainingIgnoreCaseAndActivoTrue(String nombre, Pageable pageable);
    List<Producto> findByNombreContainingIgnoreCaseAndActivoTrue(String nombre);

    // ── Utilidades ──
    boolean existsByNombreIgnoreCase(String nombre);

    // ── Conservadas por compatibilidad ──
    Page<Producto> findByNombreContainingIgnoreCase(String nombre, Pageable pageable);
    List<Producto> findByNombreContainingIgnoreCase(String nombre);
}