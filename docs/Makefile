FILES=${patsubst %.er,%.pdf,${wildcard *.er}}
ERD=${HOME}/.cabal/bin/erd

%.pdf: %.er
	$(ERD) -i $< -o $@

generate: $(FILES)

clean:
	rm -f *.pdf
