
.PHONY: protos

protos:
	python -m grpc_tools.protoc -I=protos --python_out=data_collection/models --grpc_python_out=data_collection/models protos/stock_data.proto
	cd frontend && protoc -I=../protos --js_out=import_style=commonjs,binary:src ../protos/stock_data.proto
