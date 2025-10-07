// src/app/services/dxf-preview.service.ts
import { Injectable } from '@angular/core';
import * as THREE from 'three';
import DxfParser from 'dxf-parser';

@Injectable({
  providedIn: 'root'
})
export class DxfPreviewService {

  async generatePreview(file: File): Promise<string | null> {
    try {
      // Lê o arquivo como texto
      const text = await this.readFileAsText(file);
      
      // Parse do DXF
      const parser = new DxfParser();
      const dxf = parser.parseSync(text);
      
      if (!dxf) return null;

      // Cria a cena Three.js
      const scene = new THREE.Scene();
      const camera = new THREE.OrthographicCamera(-100, 100, 100, -100, 1, 1000);
      const renderer = new THREE.WebGLRenderer({ 
        antialias: true, 
        alpha: true,
        preserveDrawingBuffer: true 
      });
      
      renderer.setSize(200, 200);
      renderer.setClearColor(0xffffff, 1);

      // Processa as entidades do DXF
      this.processDxfEntities(dxf.entities, scene);

      // Ajusta a câmera para mostrar todo o conteúdo
      this.fitCameraToObjects(scene, camera);

      // Renderiza e retorna como data URL
      renderer.render(scene, camera);
      const dataUrl = renderer.domElement.toDataURL('image/png');
      
      // Limpeza
      renderer.dispose();
      
      return dataUrl;
    } catch (error) {
      console.error('Erro ao gerar prévia DXF:', error);
      return null;
    }
  }

  private readFileAsText(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as string);
      reader.onerror = reject;
      reader.readAsText(file);
    });
  }

  private processDxfEntities(entities: any[], scene: THREE.Scene): void {
    entities.forEach(entity => {
      switch (entity.type) {
        case 'LINE':
          this.addLine(entity, scene);
          break;
        case 'CIRCLE':
          this.addCircle(entity, scene);
          break;
        case 'ARC':
          this.addArc(entity, scene);
          break;
        case 'POLYLINE':
        case 'LWPOLYLINE':
          this.addPolyline(entity, scene);
          break;
        // Adicione mais tipos conforme necessário
      }
    });
  }

  private addLine(entity: any, scene: THREE.Scene): void {
    const geometry = new THREE.BufferGeometry();
    const points = [
      new THREE.Vector3(entity.start.x, entity.start.y, entity.start.z || 0),
      new THREE.Vector3(entity.end.x, entity.end.y, entity.end.z || 0)
    ];
    geometry.setFromPoints(points);
    
    const material = new THREE.LineBasicMaterial({ color: 0x000000 });
    const line = new THREE.Line(geometry, material);
    scene.add(line);
  }

  private addCircle(entity: any, scene: THREE.Scene): void {
    const geometry = new THREE.CircleGeometry(entity.radius, 32);
    const material = new THREE.LineBasicMaterial({ color: 0x000000 });
    const circle = new THREE.LineLoop(geometry, material);
    circle.position.set(entity.center.x, entity.center.y, entity.center.z || 0);
    scene.add(circle);
  }

  private addArc(entity: any, scene: THREE.Scene): void {
    const geometry = new THREE.CircleGeometry(
      entity.radius, 
      32, 
      entity.startAngle, 
      entity.endAngle - entity.startAngle
    );
    const material = new THREE.LineBasicMaterial({ color: 0x000000 });
    const arc = new THREE.Line(geometry, material);
    arc.position.set(entity.center.x, entity.center.y, entity.center.z || 0);
    scene.add(arc);
  }

  private addPolyline(entity: any, scene: THREE.Scene): void {
    if (!entity.vertices || entity.vertices.length < 2) return;
    
    const points = entity.vertices.map((vertex: any) => 
      new THREE.Vector3(vertex.x, vertex.y, vertex.z || 0)
    );
    
    const geometry = new THREE.BufferGeometry();
    geometry.setFromPoints(points);
    
    const material = new THREE.LineBasicMaterial({ color: 0x000000 });
    const line = new THREE.Line(geometry, material);
    scene.add(line);
  }

  private fitCameraToObjects(scene: THREE.Scene, camera: THREE.OrthographicCamera): void {
    const box = new THREE.Box3();
    scene.traverse((object) => {
      if (object instanceof THREE.Mesh || object instanceof THREE.Line) {
        box.expandByObject(object);
      }
    });

    if (box.isEmpty()) {
      camera.position.set(0, 0, 100);
      return;
    }

    const center = box.getCenter(new THREE.Vector3());
    const size = box.getSize(new THREE.Vector3());
    
    const maxDim = Math.max(size.x, size.y);
    const fov = maxDim * 1.2;
    
    camera.left = center.x - fov;
    camera.right = center.x + fov;
    camera.top = center.y + fov;
    camera.bottom = center.y - fov;
    camera.position.set(center.x, center.y, 100);
    camera.lookAt(center.x, center.y, 0);
    camera.updateProjectionMatrix();
  }
}