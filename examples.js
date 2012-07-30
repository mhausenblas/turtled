var ex1 = '@prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#> .\n\
@prefix foaf: <http://xmlns.com/foaf/0.1/> .\n\
@prefix : <http://example.org/#> .\n\
\n\
:m a foaf:Person ;\n\
    rdfs:label "Michael" ;\n\
    foaf:knows :r ;\n\
.\n\
\n\
:r a foaf:Person ;\n\
   rdfs:label "Richard" ;\n\
.';

var ex2 = '@prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#> .\n\
@prefix foaf: <http://xmlns.com/foaf/0.1/> .\n\
@prefix dc: <http://purl.org/dc/elements/1.1/> .\n\
@prefix schema: <http://schema.org/> .\n\
@prefix : <http://example.org/#> .\n\
\n\
:m a foaf:Person ;\n\
    rdfs:label "Michael" ;\n\
    dc:author :p ;\n\
.\n\
\n\
:p a schema:ScholarlyArticle ;\n\
   rdfs:label "A very important lesson learned ..." ;\n\
   dc:created "2011-11-11" ;\n\
.';

var ex3 = '@prefix foaf: <http://xmlns.com/foaf/0.1/> .\n\
@prefix geo: <http://www.w3.org/2003/01/geo/wgs84_pos#> .\n\
@prefix : <http://example.org/#> .\n\
\n\
:i foaf:based_near <http://dbpedia.org/resource/Galway>,\n\
                   _:bn0 .\n\
\n\
_:bn0 geo:lat "53.2719444" ;\n\
      geo:long "-9.0488889" ;\n\
.';