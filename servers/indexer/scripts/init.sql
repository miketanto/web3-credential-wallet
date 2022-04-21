-- Create type citext for hex data
CREATE EXTENSION IF NOT EXISTS citext;

-- Note: CREATE OR REPLACE since CREATE IF NOT EXISTS doesn't exist for FUNCTION
--
-- Argument: {INT} maxNumber - Max Block Number to query up to
-- Returns table of {INT} number
-- Example: SELECT findMissingBlockNumbers(9);
CREATE OR REPLACE FUNCTION findMissingBlockNumbers(INT)
RETURNS TABLE (number INT) AS $$
DECLARE
    -- Init variables (max number is injected as prepared)
    number INT := 1;
    maxNumber ALIAS FOR $1;
BEGIN
    -- Create temporary table to hold all to-be-searched block numbers
    CREATE TEMPORARY TABLE "NumberSeq" (
      number INT
    );

    -- Add 1...maxNumber into the temporary table
    WHILE number <= maxNumber LOOP
        INSERT INTO "NumberSeq" VALUES (number);
        number := number + 1;
    END LOOP;

    -- Compare the two tables and select missing block numbers
    RETURN QUERY SELECT s.number
    FROM "NumberSeq" s
    LEFT JOIN "Blocks" b ON s.number = b.number
    WHERE b.number IS NULL;

    -- Clear & Return
    DROP TABLE "NumberSeq";
END;
$$ LANGUAGE plpgsql;
