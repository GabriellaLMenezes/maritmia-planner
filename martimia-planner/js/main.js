function createChart(data)
    {
      // Specify the chart’s dimensions.
      const width = 928;
      const height = width;
      const radius = width / 6;
    
      // Create the color scale.
      const color = d3.scaleOrdinal(d3.quantize(d3.interpolateRainbow, data.children.length + 1));
    
      // Compute the layout.
      const hierarchy = d3.hierarchy(data)
          .sum(d => d.value)
          .sort((a, b) => b.value - a.value);
      const root = d3.partition()
          .size([2 * Math.PI, hierarchy.height + 1])
        (hierarchy);
      root.each(d => d.current = d);
    
      // Create the arc generator.
      const arc = d3.arc()
          .startAngle(d => d.x0)
          .endAngle(d => d.x1)
          .padAngle(d => Math.min((d.x1 - d.x0) / 2, 0.005))
          .padRadius(radius * 1.5)
          .innerRadius(d => d.y0 * radius)
          .outerRadius(d => Math.max(d.y0 * radius, d.y1 * radius - 1))
    
      // Create the SVG container.
      const svg = d3.create("svg")
          .attr("viewBox", [-width / 2, -height / 2, width, width])
          .style("font", "23px sans-serif");
    
      // Append the arcs.
      const path = svg.append("g")
        .selectAll("path")
        .data(root.descendants().slice(1))
        .join("path")
          .attr("fill", d => { while (d.depth > 1) d = d.parent; return color(d.data.name); })
          .attr("fill-opacity", d => arcVisible(d.current) ? (d.children ? 0.6 : 0.4) : 0)
          .attr("pointer-events", d => arcVisible(d.current) ? "auto" : "none")
    
          .attr("d", d => arc(d.current));
    
      // Make them clickable if they have children.
      path.filter(d => d.children)
          .style("cursor", "pointer")
          .on("click", clicked);
    
      const format = d3.format(",d");
      path.append("title")
          .text(d => `${d.ancestors().map(d => d.data.name).reverse().join("/")}\n${format(d.value)}`);
    
      const label = svg.append("g")
          .attr("pointer-events", "none")
          .attr("text-anchor", "middle")
          .style("user-select", "none")
        .selectAll("text")
        .data(root.descendants().slice(1))
        .join("text")
          .attr("dy", "0.35em")
          .attr("fill-opacity", d => +labelVisible(d.current))
          .attr("transform", d => labelTransform(d.current))
          .text(d => d.data.name);
    
      const parent = svg.append("circle")
          .datum(root)
          .attr("r", radius)
          .attr("fill", "none")
          .attr("pointer-events", "all")
          .on("click", clicked);
    
      // Handle zoom on click.
      function clicked(event, p) {
        parent.datum(p.parent || root);
    
        root.each(d => d.target = {
          x0: Math.max(0, Math.min(1, (d.x0 - p.x0) / (p.x1 - p.x0))) * 2 * Math.PI,
          x1: Math.max(0, Math.min(1, (d.x1 - p.x0) / (p.x1 - p.x0))) * 2 * Math.PI,
          y0: Math.max(0, d.y0 - p.depth),
          y1: Math.max(0, d.y1 - p.depth)
        });
    
        const t = svg.transition().duration(750);
    
        // Transition the data on all arcs, even the ones that aren’t visible,
        // so that if this transition is interrupted, entering arcs will start
        // the next transition from the desired position.
        path.transition(t)
            .tween("data", d => {
              const i = d3.interpolate(d.current, d.target);
              return t => d.current = i(t);
            })
          .filter(function(d) {
            return +this.getAttribute("fill-opacity") || arcVisible(d.target);
          })
            .attr("fill-opacity", d => arcVisible(d.target) ? (d.children ? 0.6 : 0.4) : 0)
            .attr("pointer-events", d => arcVisible(d.target) ? "auto" : "none") 
    
            .attrTween("d", d => () => arc(d.current));
    
        label.filter(function(d) {
            return +this.getAttribute("fill-opacity") || labelVisible(d.target);
          }).transition(t)
            .attr("fill-opacity", d => +labelVisible(d.target))
            .attrTween("transform", d => () => labelTransform(d.current));
      }
      
      function arcVisible(d) {
        return d.y1 <= 3 && d.y0 >= 1 && d.x1 > d.x0;
      }
    
      function labelVisible(d) {
        return d.y1 <= 3 && d.y0 >= 1 && (d.y1 - d.y0) * (d.x1 - d.x0) > 0.03;
      }
    
      function labelTransform(d) {
        const x = (d.x0 + d.x1) / 2 * 180 / Math.PI;
        const y = (d.y0 + d.y1) / 2 * radius;
        return `rotate(${x - 90}) translate(${y},0) rotate(${x < 180 ? 0 : 180})`;
      }

      const divTickersList = document.querySelector("#teste")
      divTickersList.append(svg.node())

      console.log(svg.node())
      return svg.node();
    }
    
  

  const data = {
    "name":"flare",
    "children":[
       {
          "name":"Mercado",
          "children":[
             {
                "name":"Hortifruti",
                "children":[
                   {
                      "name":"Vegetais",
                      "value":50
                   },
                   {
                      "name":"Verduras",
                      "value":100
                   },
                   {
                      "name":"Frutas",
                      "value":200
                   },
                ]
             },
             {
                "name":"Açougue",
                "children":[
                   {
                      "name":"Churrasco",
                      "children":[
                        {
                        "name": "Picanha",
                        "value": 200
                        },
                        {
                           "name": "Maminha",
                           "value": 100
                        },
                        {
                           "name": "Alcatra",
                           "value": 75
                        },
                        {
                           "name": "Pão de Alho",
                           "value": 100
                        }
                      ]
                   },
                   {
                      "name":"Carne",
                      "value":200
                   },
                   {
                      "name":"Linguiça",
                      "value": 100
                   },
                   {
                      "name":"Frango",
                      "value":50
                   },
                ]
             },
             {
                "name":"Padaria",
                "children":[
                   {
                     "name":"Pão",
                     "value": 50
                   },
                   {
                     "name":"Bolos",
                     "value":100
                  },
                  {
                     "name":"Biscoitos",
                     "value":200
                  },
                  {
                     "name":"Doces",
                     "value": 150
                  },
                  {
                     "name": "Salgados",
                     "value": 100
                  }
                ]
             },
             {
               "name": "Higiene",
               "children": [
                  {
                     "name": "Sabonete",
                     "value": 50
                  },
                  {
                     "name": "Shampoo",
                     "value": 100
                  },
                  {
                     "name": "Creme Dental",
                     "value": 200
                  },
                  {
                     "name": "Desodorante",
                     "value": 150
                  },
                  {
                     "name": "Papel Higiênico",
                     "value": 100
                  }
               ]
             }
          ]
       },
       {
          "name":"Farmacia",
          "children":[
            {
               "name": "Remédios",
               "value": 100
            },
            {
               "name": "Vitaminas",
               "value": 50
            },
            {
               "name": "Suplementos",
               "value": 200
            },
          ]
       },
       {
          "name":"Contas",
          "children":[
            {
               "name": "Água",
               "value": 100
            },
            {
               "name": "Luz",
               "value": 50
            },
            {
               "name": "Telefone",
               "value": 200
            },
            {
               "name": "Internet",
               "value": 150
            },
            {
               "name": "TV",
               "value": 100
            }
          ]
       },
       {
          "name":"Lazer",
          "children":[
            {
               "name": "Bar",
               "value": 100
            },
            {
               "name": "Restaurante",
               "value": 50
            },
            {
               "name": "Cinema",
               "value": 200
            },
            {
               "name": "Teatro",
               "value": 150
            },
            {
               "name": "Viagem",
               "children":[
                  {
                     "name": "Passagem",
                     "value": 50
                  },
                  {
                     "name": "Hospedagem",
                     "value": 100
                  },
                  {
                     "name": "Passeios",
                     "value": 200
                  },
                  {
                     "name": "Alimentação",
                     "value": 150
                  }
               ]
            }
          ]
       },
       {
          "name":"Reserva",
          "children":[
             {
               "name": "Poupança",
               "value": 100
             },
             {
               "name": "Tesouro Direto",
               "value": 50
             },
             {
               "name": "Ações",
               "value": 200
             },
             {
               "name": "CDB",
               "value": 150
             },
             {
               "name": "LCI",
               "value": 100
             }
          ]
       },
    ]
 }
  