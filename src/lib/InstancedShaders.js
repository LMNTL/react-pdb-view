THREE.ShaderLib.customDepthRGBA = { // this is a cut-and-paste of the depth shader -- modified to accommodate instancing for this app

    uniforms: ShaderLib.depth.uniforms,

    vertexShader:
        `
        // instanced
        #ifdef INSTANCED

            attribute vec3 instanceOffset;
            attribute float instanceScale;

        #endif

        #include <common>
        #include <uv_pars_vertex>
        #include <displacementmap_pars_vertex>
        #include <morphtarget_pars_vertex>
        #include <skinning_pars_vertex>
        #include <logdepthbuf_pars_vertex>
        #include <clipping_planes_pars_vertex>

        void main() {

            #include <uv_vertex>

            #include <skinbase_vertex>

            #ifdef USE_DISPLACEMENTMAP

                #include <beginnormal_vertex>
                #include <morphnormal_vertex>
                #include <skinnormal_vertex>

            #endif

            #include <begin_vertex>

            // instanced
            #ifdef INSTANCED

                transformed *= instanceScale;
                transformed = transformed + instanceOffset;

            #endif

            #include <morphtarget_vertex>
            #include <skinning_vertex>
            #include <displacementmap_vertex>
            #include <project_vertex>
            #include <logdepthbuf_vertex>
            #include <clipping_planes_vertex>

        }
    `,

    fragmentShader: THREE.ShaderChunk.depth_frag

};

ShaderLib.lambert = { // this is a cut-and-paste of the lambert shader -- modified to accommodate instancing for this app

    uniforms: ShaderLib.lambert.uniforms,

    vertexShader:
        `
        #define LAMBERT

        #ifdef INSTANCED
            attribute vec3 instanceOffset;
            attribute vec3 instanceColor;
            attribute float instanceScale;
        #endif

        varying vec3 vLightFront;

        #ifdef DOUBLE_SIDED

            varying vec3 vLightBack;

        #endif

        #include <common>
        #include <uv_pars_vertex>
        #include <uv2_pars_vertex>
        #include <envmap_pars_vertex>
        #include <bsdfs>
        #include <lights_pars_begin>
        #include <color_pars_vertex>
        #include <fog_pars_vertex>
        #include <morphtarget_pars_vertex>
        #include <skinning_pars_vertex>
        #include <shadowmap_pars_vertex>
        #include <logdepthbuf_pars_vertex>
        #include <clipping_planes_pars_vertex>

        void main() {

            #include <uv_vertex>
            #include <uv2_vertex>
            #include <color_vertex>

            // vertex colors instanced
            #ifdef INSTANCED
                #ifdef USE_COLOR
                    vColor.xyz = instanceColor.xyz;
                #endif
            #endif

            #include <beginnormal_vertex>
            #include <morphnormal_vertex>
            #include <skinbase_vertex>
            #include <skinnormal_vertex>
            #include <defaultnormal_vertex>

            #include <begin_vertex>

            // position instanced
            #ifdef INSTANCED
                transformed *= instanceScale;
                transformed = transformed + instanceOffset;
            #endif

            #include <morphtarget_vertex>
            #include <skinning_vertex>
            #include <project_vertex>
            #include <logdepthbuf_vertex>
            #include <clipping_planes_vertex>

            #include <worldpos_vertex>
            #include <envmap_vertex>
            #include <lights_lambert_vertex>
            #include <shadowmap_vertex>
            #include <fog_vertex>

        }
        `,

    fragmentShader: ShaderLib.lambert.fragmentShader

};